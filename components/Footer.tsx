import EmailSignup from './EmailSignup';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-5xl mx-auto px-5 py-14 grid gap-10 sm:grid-cols-2 items-start">

        <div>
          <p className="font-serif text-2xl text-espresso mb-2">Moderate Glutton</p>
          <p className="text-sm text-muted leading-relaxed max-w-xs">
            A home cook, engineer, and Type&nbsp;1 diabetic who overthinks just about every meal.
          </p>
        </div>

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
