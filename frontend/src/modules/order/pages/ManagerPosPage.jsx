import SharedPosPage from "./SharedPosPage";

const ManagerPosPage = () => (
  <SharedPosPage
    title="Quay goi mon (Manager POS)"
    subtitle="Chon mon an va thuc hien thanh toan ngay tai quay"
    receiptBasePath="/manager/receipts"
    emptyMenuDescription="Thuc don ngay hom nay chua duoc thiet lap hoac cong bo. Vui long nhan tao thuc don trong trang quan ly thuc don ngay."
  />
);

export default ManagerPosPage;
