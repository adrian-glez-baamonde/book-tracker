import Logo from "./Logo";

// Tarjeta común de las pantallas de acceso (login y registro)
function AuthCard({ subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="card-surface relative overflow-hidden px-8 py-10 shadow-lg">
          <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-granate via-dorado to-verde" />

          <div className="flex flex-col items-center mb-8">
            <Logo className="h-14 w-14 text-dorado mb-3" />
            <h1 className="text-4xl text-verde">Monfort</h1>
            <p className="font-serif italic text-tinta/60 mt-1">{subtitle}</p>
          </div>

          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-tinta/70">{footer}</p>
        )}
      </div>
    </div>
  );
}

export default AuthCard;
