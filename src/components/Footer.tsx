export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white/60 backdrop-blur-sm py-5 text-center">
      <p className="text-sm text-gray-500">
        Made with{' '}
        <span className="text-rose-400">❤️</span>
        {' '}by{' '}
        <a
          href="https://emilieschario.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-teal-600 hover:text-teal-700 transition-colors underline decoration-teal-300 underline-offset-2 hover:decoration-teal-500"
        >
          emilie
        </a>
      </p>
    </footer>
  );
}
