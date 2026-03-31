export default function Footer() {
  return (
    <footer className="py-5 text-center border-t border-gray-100">
      <p className="text-sm text-gray-400">
        Made with{' '}
        <span className="text-rose-400">❤️</span>
        {' '}by{' '}
        <a 
          href="https://emilieschario.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-rose-500 hover:text-rose-600 transition-colors duration-200"
        >
          emilie
        </a>
      </p>
    </footer>
  );
}
