export default function Footer() {
  return (
    <footer className="py-6 text-center">
      <p className="text-sm text-gray-400">
        Made with{' '}
        <span className="text-rose-400">❤️</span>
        {' '}by{' '}
        <a 
          href="https://emilieschario.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-rose-500 hover:text-rose-600 font-medium transition-colors"
        >
          emilie
        </a>
      </p>
    </footer>
  );
}
