import { ReactNode, useMemo } from "react";
import { Navbar, Alignment, Button as BPButton } from "@blueprintjs/core";
import { NavLink, useLocation } from "react-router-dom";
import { Page, Tabbar, Tab } from "react-onsenui";

interface AppLayoutProps {
  children: ReactNode;
}

const MobileTabbar = () => {
  const location = useLocation();
  const activeIndex = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return 1;
    return 0;
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      <Page>
        <Tabbar
          index={activeIndex}
          renderTabs={() => [
            {
              content: <Page key="home" />,
              tab: (
                <Tab
                  key="home"
                  label="Главная"
                  icon="md-home"
                  onClick={() => (window.location.href = "/")}
                />
              ),
            },
            {
              content: <Page key="admin" />,
              tab: (
                <Tab
                  key="admin"
                  label="Админ"
                  icon="md-settings"
                  onClick={() => (window.location.href = "/admin")}
                />
              ),
            },
          ]}
        />
      </Page>
    </div>
  );
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <Navbar className="container">
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>
              <a href="/" className="text-xl font-extrabold tracking-tight">
                SportFlow
              </a>
            </Navbar.Heading>
            <Navbar.Divider />
            <NavLink to="/" className={({ isActive }) => isActive ? "text-primary font-semibold" : "text-foreground/70 hover:text-foreground"}>
              Главная
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `${isActive ? "text-primary font-semibold" : "text-foreground/70 hover:text-foreground"} ml-4`}>
              Админ-панель
            </NavLink>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <BPButton minimal intent="primary" className="hidden sm:inline-flex">
              Войти
            </BPButton>
            <BPButton intent="primary" className="ml-2">
              Регистрация
            </BPButton>
          </Navbar.Group>
        </Navbar>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t mt-12">
        <div className="container py-8 text-sm text-foreground/60 flex items-center justify-between">
          <p>© {new Date().getFullYear()} SportFlow. Все права защищены.</p>
          <p className="hidden sm:block">Система управления спортсме��ами • Аналитика • Роли • Медиа</p>
        </div>
      </footer>

      {/* Mobile Tabbar */}
      <MobileTabbar />
    </div>
  );
}
