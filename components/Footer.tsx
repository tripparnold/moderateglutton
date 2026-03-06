import EmailSignup from './EmailSignup';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-5xl mx-auto px-5 py-14 max-w-md">
        <EmailSignup />
      </div>

      <div className="border-t border-border">
        <p className="text-center text-xs text-muted py-5">
          © {new Date().getFullYear()} Moderate Glutton
        </p>
      </div>
    </footer>
  );
}
