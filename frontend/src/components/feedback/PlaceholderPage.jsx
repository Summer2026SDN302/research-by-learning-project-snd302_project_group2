const PlaceholderPage = ({ title, description }) => {
  return (
    <section className="card">
      <h1 className="text-headline-md text-on-surface font-bold">{title}</h1>
      <p className="text-body-md text-on-surface-variant mt-2">
        {description || "Trang này sẽ được nối UI và API ở bước tiếp theo."}
      </p>
    </section>
  );
};

export default PlaceholderPage;
