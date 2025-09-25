import { ReactNode, useMemo } from "react";
import { Navbar, Alignment, Button as BPButton } from "@blueprintjs/core";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "@/components/ui/BrandLogo";

interface AppLayoutProps {
  children: ReactNode;
}

const MobileTabbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-2xl grid grid-cols-2 h-14">
        <button
          type="button"
          onClick={() => navigate("/")}
          className={`flex items-center justify-center text-sm font-medium transition-colors ${
            !isAdmin
              ? "text-primary"
              : "text-foreground/70 hover:text-foreground"
          }`}
        >
          Главная
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className={`flex items-center justify-center text-sm font-medium transition-colors ${
            isAdmin
              ? "text-primary"
              : "text-foreground/70 hover:text-foreground"
          }`}
        >
          Админ
        </button>
      </div>
    </nav>
  );
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <Navbar className="container">
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>
              <BrandLogo />
            </Navbar.Heading>
            <Navbar.Divider />
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-primary font-semibold"
                  : "text-foreground/70 hover:text-foreground"
              }
            >
              Главная
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${isActive ? "text-primary font-semibold" : "text-foreground/70 hover:text-foreground"} ml-4`
              }
            >
              Админ-панель
            </NavLink>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <BPButton
              minimal
              intent="primary"
              className="hidden sm:inline-flex"
            >
              Войти
            </BPButton>
            <BPButton intent="primary" className="ml-2">
              Регистрация
            </BPButton>
          </Navbar.Group>
        </Navbar>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t mt-12">
        <div className="container py-8 text-sm text-foreground/60 flex items-center justify-between">
          <p>© {new Date().getFullYear()} SportFlow. Все права защищены.</p>
          <p className="hidden sm:block">
            Система управления спортсме��ами • Аналитика • Роли • Медиа
          </p>
        </div>
      </footer>

      {/* Mobile Tabbar */}
      <MobileTabbar />
    </div>
  );
}
