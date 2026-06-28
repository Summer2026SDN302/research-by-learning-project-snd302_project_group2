import SharedPosPage from "./SharedPosPage";

const StaffPosPage = () => (
  <SharedPosPage
    title="Quay goi mon (POS)"
    subtitle="Chon cac mon an khach goi de thanh toan va in bien lai"
    receiptBasePath="/staff/receipts"
    emptyMenuDescription="Thuc don ngay hom nay chua duoc Manager/Admin thiet lap hoac cong bo. Vui long quay lai sau hoac lien he quan ly de tao thuc don."
  />
);

export default StaffPosPage;
