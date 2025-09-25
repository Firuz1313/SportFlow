import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import ParallaxScene from "@/components/ui/ParallaxScene";
import AnimatedBallPath from "@/components/ui/AnimatedBallPath";
import { Table, Tag, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Box, Meter, Stack, Text } from "grommet";
import { Athlete, ListResponse } from "@shared/api";

async function fetchAthletes(): Promise<ListResponse<Athlete>> {
  const r = await fetch("/api/athletes");
  if (!r.ok) throw new Error("Failed to fetch athletes");
  return r.json();
}

export default function Index() {
  const { data, isLoading } = useQuery({
    queryKey: ["athletes"],
    queryFn: fetchAthletes,
  });
  const items = data?.items ?? [];

  const columns: ColumnsType<Athlete> = useMemo(
    () => [
      {
        title: "Спортсмен",
        dataIndex: "firstName",
        key: "name",
        render: (_: any, a: Athlete) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={a.avatarUrl}
              size={40}
              style={{ backgroundColor: "#87d068" }}
            >
              {a.firstName[0]}
            </Avatar>
            <div>
              <div className="font-semibold">
                {a.firstName} {a.lastName}
              </div>
              <div className="text-foreground/60 text-xs">
                {a.team ?? "Индивидуально"}
              </div>
            </div>
          </div>
        ),
      },
      { title: "Возраст", dataIndex: "age", key: "age", width: 90 },
      { title: "Вид спорта", dataIndex: "sport", key: "sport" },
      {
        title: "Показатели",
        key: "metrics",
        render: (_: any, a: Athlete) => (
          <div className="flex gap-2">
            {a.metrics?.speed != null && (
              <Tag color="green">Скорость: {a.metrics.speed}</Tag>
            )}
            {a.metrics?.endurance != null && (
              <Tag color="blue">Выносливость: {a.metrics.endurance}</Tag>
            )}
            {a.metrics?.strength != null && (
              <Tag color="gold">Сила: {a.metrics.strength}</Tag>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  const totals = useMemo(
    () => ({
      athletes: items.length,
      withTeams: items.filter((a) => a.team).length,
    }),
    [items],
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/10 via-transparent to-yellow-400/10" />
      {/* Hero */}
      <section className="container relative py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Спортивная платформа управления спортсменами
            </h1>
            <p className="mt-4 text-lg text-foreground/70">
              Профили, роли, аналитика и медиа. Современный интерфейс для клуба,
              тренера и спортсмена.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/admin"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 font-semibold shadow hover:opacity-90 transition transform hover:scale-[1.02] active:scale-95"
              >
                Перейти в админ-панель
              </a>
              <a
                href="#athletes"
                className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 font-semibold hover:bg-secondary transition transform hover:scale-[1.02] active:scale-95"
              >
                Смотреть спортсменов
              </a>
            </div>
            <div className="mt-6">
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <StatCard label="Спортсмены" value={totals.athletes} />
                <StatCard label="С командами" value={totals.withTeams} />
                <BrandMeter />
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ParallaxScene />
            <Card shadow="sm" className="border">
              <CardHeader className="font-semibold">Администратор</CardHeader>
              <CardBody className="text-foreground/70 text-sm">
                Управление пользователями и ролями, модерация контента,
                настройки доступа и аналитика системы.
              </CardBody>
            </Card>
            <Card shadow="sm" className="border">
              <CardHeader className="font-semibold">Тренер</CardHeader>
              <CardBody className="text-foreground/70 text-sm">
                Ведение состава, планирование тренировок, наблюдение за
                метриками спортсменов.
              </CardBody>
            </Card>
            <Card shadow="sm" className="border">
              <CardHeader className="font-semibold">Спортсмен</CardHeader>
              <CardBody className="text-foreground/70 text-sm">
                Личный профиль, загрузка медиа, отслеживание прогресса и целей.
              </CardBody>
            </Card>
            <Card shadow="sm" className="border">
              <CardHeader className="font-semibold">Аналитика</CardHeader>
              <CardBody className="text-foreground/70 text-sm">
                Гибкая статистика по показателям, командам и видам спорта в
                реальном времени.
              </CardBody>
            </Card>
          </div>
        </div>
        <AnimatedBallPath className="absolute inset-0" />
      </section>

      {/* Highlights */}
      {items.length > 0 && (
        <section className="container pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="rounded-xl border bg-card p-4 shadow-sm hover:shadow transition"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={a.avatarUrl}
                    size={48}
                    style={{ backgroundColor: "#10b981", color: "white" }}
                  >
                    {a.firstName[0]}
                  </Avatar>
                  <div>
                    <div className="font-semibold leading-tight">
                      {a.firstName} {a.lastName}
                    </div>
                    <div className="text-xs text-foreground/60">{a.sport}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {a.metrics?.speed != null && (
                    <div className="rounded-md bg-secondary px-2 py-1 text-xs">
                      Скорость {a.metrics.speed}
                    </div>
                  )}
                  {a.metrics?.endurance != null && (
                    <div className="rounded-md bg-secondary px-2 py-1 text-xs">
                      Вынос {a.metrics.endurance}
                    </div>
                  )}
                  {a.metrics?.strength != null && (
                    <div className="rounded-md bg-secondary px-2 py-1 text-xs">
                      Сила {a.metrics.strength}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Athletes preview */}
      <section id="athletes" className="container pb-20">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-bold">Спортсмены</h2>
          <span className="text-sm text-foreground/60">
            Данные загружаются из API
          </span>
        </div>
        <div className="rounded-xl border bg-card p-2 overflow-x-auto">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={items}
            loading={isLoading}
            pagination={{ pageSize: 8, showTotal: (t) => `Всего: ${t}` }}
            size="middle"
          />
        </div>
      </section>

      {/* Neon notice (hide when есть данные) */}
      {items.length === 0 && (
        <section className="container pb-16">
          <div className="bp4-callout bp4-intent-primary">
            <h3 className="bp4-heading">
              Подключите базу данных Neon (PostgreSQL)
            </h3>
            <p>
              Для постоянного хранения данных подключите Neon через MCP
              интеграцию. Затем установите переменную окружения DATABASE_URL.
            </p>
          </div>
        </section>
      )}
      <a
        href="/admin"
        className="fixed right-6 bottom-6 sm:hidden inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition"
        aria-label="Доба��ить спортсмена"
      >
        +
      </a>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-foreground/60">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function BrandMeter() {
  return (
    <div className="rounded-lg border bg-card p-3">
      <Text size="small" className="text-foreground/60">
        Активность
      </Text>
      <Stack anchor="center">
        <Meter
          values={[{ value: 70, color: "#10b981" }]}
          thickness="small"
          size="small"
        />
      </Stack>
    </div>
  );
}
