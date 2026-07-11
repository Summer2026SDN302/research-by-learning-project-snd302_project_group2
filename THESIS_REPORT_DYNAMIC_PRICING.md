# Báo cáo Kỹ thuật: Hệ thống Định giá Động (Dynamic Pricing System)

## 1. Tổng quan (Overview)
Trong nghiệp vụ quản lý bán hàng canteen (StallBox), thức ăn là loại hàng hóa có thời hạn sử dụng trong ngày (Perishable Goods). Việc thức ăn tồn kho quá nhiều vào cuối ngày gây ra tổn thất chi phí lớn. 

**Mục tiêu của hệ thống Dynamic Pricing:** Tự động đề xuất các mức giảm giá linh hoạt (Discount Rules) vào các khung giờ cuối ngày nhằm:
1. Thúc đẩy doanh số, thanh lý tối đa lượng thức ăn tồn đọng.
2. Giảm thiểu rủi ro thua lỗ do thực phẩm hết hạn phải tiêu hủy.
3. Vẫn đảm bảo biên lợi nhuận tối thiểu (Floor Price).

## 2. Lựa chọn Kiến trúc: Vì sao lại là Hybrid Architecture?
Khi thiết kế hệ thống định giá động, một sai lầm phổ biến là sử dụng Deep Learning/Reinforcement Learning (Học tăng cường) để dự đoán trực tiếp giá bán. Điều này đặc biệt rủi ro với các hệ thống quản lý tài chính vì tính chất **"Hộp đen" (Black-box)** của AI: mô hình có thể vô tình đưa ra các mức giá bán thấp hơn giá vốn gây thua lỗ mà không thể giải thích được lý do.

Do đó, đồ án StallBox áp dụng **Kiến trúc Lai (Hybrid Architecture)**, tách biệt hoàn toàn giữa việc *dự đoán số lượng* và *tính toán giá tiền*:

### 2.1. Machine Learning Forecasting (Dự báo bằng Học máy - Python)
*   **Nhiệm vụ:** Dự báo chính xác **Tổng nhu cầu trong ngày ($D_{total}$)** dựa trên lịch sử bán hàng phức tạp, tính chu kỳ và mức độ cạnh tranh của thực đơn.
*   **Thuật toán:** XGBoost Regression & Random Forest.
*   **Lý do:** Học máy cực kỳ xuất sắc trong việc tìm ra quy luật phi tuyến tính từ các yếu tố bên ngoài (ngày cuối tuần, món ăn chung lịch...), điều mà con người không thể tính nhẩm thủ công.

### 2.2. Rule-based Pricing (Định giá theo Quy tắc - Node.js)
*   **Nhiệm vụ:** Áp dụng hệ luật kinh doanh (If-Then) dựa trên lượng tồn kho thực tế, nhu cầu dự báo từ AI và các quy tắc giảm giá do nhà quản lý tự cấu hình.
*   **Lý do:** 
    *   **Minh bạch (Transparent):** Mọi công thức giảm giá đều rõ ràng, dễ dàng truy vết và điều chỉnh (VD: Giảm 20% sau 14h, giảm 50% sau 17h).
    *   **An toàn tài chính (Financial Safety):** Đảm bảo giá bán luôn lớn hơn giá vốn tối thiểu bằng các chốt chặn (hard constraints).
    *   **Hiệu năng (Performance):** Tính toán trực tiếp trên Node.js theo thời gian thực (real-time) mà không bị độ trễ (latency) khi gọi API HTTP sang FastAPI service.

---

## 3. Luồng Thuật toán Định giá (Pricing Algorithm Flow)

Thuật toán định giá động được thực thi tại Backend Node.js mỗi khi nhà quản lý kiểm tra (hoặc Job Scheduler tự động chạy). Quá trình diễn ra theo các bước sau:

### Bước 1: Tính toán Nhu cầu Còn lại (Remaining Demand)
Dựa vào tổng nhu cầu do AI dự báo ($D_{total}$) và số lượng đã bán thực tế tính đến thời điểm hiện tại ($SoldToday$).
$$D_{remain} = \max(0, D_{total} - SoldToday)$$
*(Hệ thống sử dụng $\max(0, ...)$ để đảm bảo nếu bán vượt quá dự báo thì nhu cầu còn lại bằng 0, không mang giá trị âm).*

### Bước 2: Dự báo Tồn dư (Excess Inventory Prediction)
So sánh số lượng thực tế đang còn trong bếp/quầy ($Quantity_{current}$) với Nhu cầu còn lại.
$$Excess = \max(0, Quantity_{current} - D_{remain})$$
- Nếu $Excess > 0$: Hệ thống dự báo sẽ bị dư thừa thực phẩm cuối ngày. Hệ thống sẽ **kích hoạt** các luật giảm giá.
- Nếu $Excess \le 0$: Hệ thống dự báo bán vừa hết hoặc thiếu. Hệ thống **từ chối** kích hoạt giảm giá (bán nguyên giá).

### Bước 3: Áp dụng Luật Giảm giá (Discount Rules Matching)
Hệ thống sẽ đối chiếu thời gian hiện tại ($Time_{current}$) và Tỷ lệ Tồn dư (Excess Ratio = $Excess / Quantity_{current}$) với các quy tắc được định nghĩa.
Các mốc xả hàng được cấu hình chia thành ca trưa và ca tối:

| Khung giờ | Tỷ lệ Tồn dư (Excess Ratio) | % Giảm giá (Discount) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **12:30 - 14:00**<br>*(Xả quầy trưa)* | 10% - 30%<br>30% - 60%<br>> 60% | **10%**<br>**20%**<br>**30%** | Xả hàng ca trưa trước khi nghỉ. |
| **16:00 - 18:00**<br>*(Sắp đóng tối)* | 10% - 30%<br>30% - 60%<br>> 60% | **10%**<br>**20%**<br>**30%** | Khuyến khích mua sớm vào buổi chiều. |
| **Sau 18:00**<br>*(Sát giờ đóng)* | 10% - 30%<br>30% - 60%<br>> 60% | **20%**<br>**30%**<br>**50%** | Xả mạnh cuối ngày để tránh đổ bỏ. |

Hệ thống sẽ lấy ra mức giảm giá tương ứng dựa vào thời điểm chạy hàm và tỷ lệ hàng tồn kho hiện tại.
Mức giá đề xuất ban đầu:
$$Price_{candidate} = BasePrice \times (1 - Discount\%)$$

### Bước 4: Chốt chặn Bảo vệ Biên lợi nhuận (Floor Price Hard-Constraint)
Đây là bước quan trọng nhất của hệ thống Rule-based nhằm ngăn chặn thua lỗ. Dù được cấu hình giảm giá cao đến đâu (kể cả 90%), hệ thống luôn kiểm tra với Giá Vốn (Cost).
Biên lợi nhuận tối thiểu (Floor Margin) thường đặt ở mức 5% (1.05).
$$Price_{floor} = Cost \times 1.05$$

Giá bán cuối cùng được quyết định là:
$$Price_{final} = \max(Price_{candidate}, Price_{floor})$$

---

## 4. Tương tác Người dùng (Human-in-the-loop)
Hệ thống StallBox không hoàn toàn tự động cập nhật giá vào cơ sở dữ liệu mà hoạt động dưới dạng **Decision Support System (Hệ hỗ trợ ra quyết định)**.
1. AI và Backend tính toán ra danh sách các món cần giảm giá kèm mức giá đề xuất (Recommended Price).
2. Danh sách được hiển thị trực quan lên màn hình Quản lý bằng các "Thẻ Gợi ý" (Insight Cards).
3. Nhà quản lý xem xét và có quyền ấn "Áp dụng (Apply)" hoặc "Từ chối (Dismiss)". 

Thiết kế này đảm bảo quyền kiểm soát cuối cùng (Final Say) luôn thuộc về con người, giúp tăng mức độ tin tưởng (trust) của người dùng đối với hệ thống phần mềm quản lý.
