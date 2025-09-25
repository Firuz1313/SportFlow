import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
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
    <div className="bg-gradient-to-b from-white to-secondary/30">
      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Динамическая платформа управления спортсменами
            </h1>
            <p className="mt-4 text-lg text-foreground/70">
              Регистрация и профили, роли (админ/спортсмен/тренер), аналитика и
              статистика, загрузка фото/видео и адаптивные интерфейсы для веба и
              мобильных устройств.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/admin"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 font-semibold shadow hover:opacity-90 transition"
              >
                Перейти в админ-панель
              </a>
              <a
                href="#athletes"
                className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 font-semibold hover:bg-secondary transition"
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
      </section>

      {/* Athletes preview */}
      <section id="athletes" className="container pb-20">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-bold">Спортсмены</h2>
          <span className="text-sm text-foreground/60">
            Данные загружаются из API
          </span>
        </div>
        <div className="bg-card rounded-lg border p-2">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={items}
            loading={isLoading}
            pagination={{ pageSize: 5, showTotal: (t) => `Всего: ${t}` }}
          />
        </div>
      </section>

      {/* Neon notice */}
      <section className="container pb-16">
        <div className="bp4-callout bp4-intent-primary">
          <h3 className="bp4-heading">
            Подключите базу данных Neon (PostgreSQL)
          </h3>
          <p>
            Для постоянного хранения данных подключите Neon через MCP
            интеграцию. Затем установите переменную окружения DATABASE_URL.
          </p>
          <ul className="list-disc ml-6 mt-2 text-sm">
            <li>
              Шаг 1: Нажмите{" "}
              <a className="underline" href="#open-mcp-popover">
                Open MCP popover
              </a>{" "}
              и подключит�� Neon.
            </li>
            <li>Шаг 2: Установите DATABASE_URL в настройках проекта.</li>
          </ul>
        </div>
      </section>
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
