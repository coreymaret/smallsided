import './PageLoader.scss';

const PageLoader = () => {
  return (
    <div className="page-loader">
      <div className="page-loader__spinner" />
      <p className="page-loader__text">Loading...</p>
    </div>
  );
};

export default PageLoader;