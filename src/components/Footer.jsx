export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 text-center p-3 text-sm">
      © {new Date().getFullYear()} BMW Data from{" "}
      <a
        href="https://www.kaggle.com/datasets?tags=11105-Education"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white"
      >
        Kaggle Education Datasets
      </a>
    </footer>
  );
}