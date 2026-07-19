[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YB-_cscJ)

# Jira

[\[Jira Link\]](https://lethuyduongc9.atlassian.net/jira/software/projects/SCRUM/boards/1?atlOrigin=eyJpIjoiMmVmNmViMmQ0YjJjNDdiNmJjY2QwNjE5YWE3ZTI1OWUiLCJwIjoiaiJ9)

# Springer LNCS LaTeX Template

Overleaf project link: https://www.overleaf.com/2821918727ccqrhwxdgvkr#6f3a88

# Link deployment

https://stall-box-web.vercel.app/

# Mục tiêu nghiên cứu hướng đến trong đề tài

## Tổng quan / Overview

Đề tài hướng đến việc xây dựng một hệ thống quản lý bán hàng quầy canteen tích hợp AI nhằm hỗ trợ dự đoán nhu cầu tiêu thụ, gợi ý điều chỉnh giá bán khi nhận thấy có dấu hiệu tồn kho, giảm lãng phí thực phẩm và hỗ trợ ra quyết định cho người quản lý.

---

## Các mục tiêu nghiên cứu chính / Main Research Objectives

### 1. Nghiên cứu mô hình dự đoán nhu cầu tiêu thụ món ăn (AI-based Food Demand Forecasting)

Hệ thống nghiên cứu và áp dụng các mô hình Machine Learning nhằm dự đoán số lượng món ăn cần chuẩn bị dựa trên dữ liệu lịch sử bán hàng, thời gian, khung giờ và xu hướng tiêu thụ.

Mục tiêu:

- Giảm tình trạng thiếu món hoặc dư thừa món ăn
- Hỗ trợ chuẩn bị nguyên liệu hiệu quả hơn
- Tăng độ chính xác trong vận hành quầy bán

---

### 2. Nghiên cứu cơ chế định giá động (Dynamic Pricing)

Cơ chế điều chỉnh giá bán linh hoạt dựa trên:

- Thời gian trong ngày
- Mức tồn kho hiện tại
- Nhu cầu tiêu thụ dự đoán
- Thời gian còn lại trước khi đóng quầy

Mục tiêu:

- Tối ưu doanh thu
- Tăng khả năng tiêu thụ món ăn tồn
- Hỗ trợ giảm food waste

---

# Hàm lượng nghiên cứu hướng đến trong đề tài

## 1. Nghiên cứu AI/ML Demand Forecasting

### Thuật toán lựa chọn / Selected Algorithm

Đề tài lựa chọn sử dụng:

- Random Forest Regression
- XGBoost Regression

Trong đó:

- Random Forest được sử dụng làm baseline model
- XGBoost được sử dụng làm mô hình dự đoán chính

---

### Lý do lựa chọn XGBoost

XGBoost được lựa chọn vì:

- Độ chính xác cao trong bài toán dự đoán dữ liệu dạng bảng (tabular data)
- Hoạt động tốt với dữ liệu bán hàng có nhiều đặc trưng
- Khả năng xử lý non-linear relationships hiệu quả
- Tốc độ training nhanh
- Không yêu cầu dữ liệu quá lớn như Deep Learning

---

### So sánh với các thuật toán khác

| Algorithm         | Advantages                     | Disadvantages                              |
| ----------------- | ------------------------------ | ------------------------------------------ |
| Linear Regression | Simple, fast                   | Poor performance with complex patterns     |
| ARIMA             | Good for pure time-series      | Hard to handle multiple features           |
| LSTM              | Strong sequential learning     | Requires large datasets and heavy training |
| Random Forest     | Stable and explainable         | Lower optimization capability              |
| XGBoost           | High accuracy, fast, optimized | More parameter tuning required             |

---

## 2. Nghiên cứu Dynamic Pricing

### Giải thuật lựa chọn / Selected Approach

Đề tài lựa chọn:

- Rule-based Pricing
- Regression-based Recommendation

---

### Mô hình hoạt động

Hệ thống điều chỉnh giá dựa trên:

- Thời gian trong ngày
- Mức tồn kho
- Demand prediction
- Thời gian còn lại trước khi đóng quầy

---

### Lý do lựa chọn Rule-based + Regression

Phương pháp kết hợp được lựa chọn vì:

- Dễ triển khai
- Dễ giải thích
- Phù hợp với business rules thực tế
- Không yêu cầu dữ liệu quá lớn
- Dễ kiểm soát giá bán

---

### So sánh với Reinforcement Learning

| Approach               | Advantages                | Disadvantages                  |
| ---------------------- | ------------------------- | ------------------------------ |
| Rule-based             | Simple and controllable   | Less adaptive                  |
| Regression-based       | Better prediction support | Requires training data         |
| Reinforcement Learning | Highly adaptive           | Complex and resource intensive |
