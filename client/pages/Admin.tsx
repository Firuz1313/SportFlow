import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Athlete, ListResponse } from "@shared/api";
import {
  Table,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Popconfirm,
  Avatar,
  Tabs,
  Tag,
  Upload,
  message,
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { motion } from "framer-motion";
import SportsBall from "@/components/ui/SportsBall";

async function fetchAthletes(): Promise<ListResponse<Athlete>> {
  const r = await fetch("/api/athletes");
  if (!r.ok) throw new Error("Failed to fetch athletes");
  return r.json();
}

export default function Admin() {
  const qc = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<{ email: string; roles: string[] } | null>(
    null,
  );
  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : ({} as any);
  const { data, isLoading } = useQuery({
    queryKey: ["athletes"],
    queryFn: fetchAthletes,
  });
  const items = data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Athlete>) => {
      const r = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Create failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Athlete>;
    }) => {
      const r = await fetch(`/api/athletes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw new Error("Update failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/athletes/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders },
      });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });

  const [form] = Form.useForm();

  const columns: ColumnsType<Athlete> = useMemo(
    () => [
      {
        title: "Спортсмен",
        dataIndex: "firstName",
        key: "name",
        render: (_: any, a: Athlete) => (
          <div className="flex items-center gap-3">
            <Avatar src={a.avatarUrl} style={{ backgroundColor: "#87d068" }}>
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
      {
        title: "Действия",
        key: "actions",
        width: 180,
        render: (_: any, a: Athlete) => (
          <Space>
            <Button
              size="small"
              onClick={() =>
                updateMutation.mutate({
                  id: a.id,
                  patch: { team: a.team ? undefined : "Команда A" },
                })
              }
            >
              Тег команда
            </Button>
            <Popconfirm
              title="Удалить?"
              onConfirm={() => deleteMutation.mutate(a.id)}
            >
              <Button size="small" danger>
                Удалить
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, updateMutation],
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/10 via-transparent to-yellow-400/10" />
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold"
          >
            Админ-панель
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              onClick={async () => {
                const r = await fetch("/api/seed", {
                  method: "POST",
                  headers: { ...authHeaders },
                });
                r.ok
                  ? message.success("Данные загружены")
                  : message.error("Ошибка импорта");
                qc.invalidateQueries({ queryKey: ["athletes"] });
              }}
            >
              Загрузить демо-данные
            </Button>
          </motion.div>
        </div>

        {!token && (
          <div className="mb-6">
            <Alert
              message="Требуется вход"
              description={
                <Form
                  layout="inline"
                  onFinish={async (values) => {
                    const r = await fetch("/api/auth/login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(values),
                    });
                    const data = await r.json();
                    if (r.ok) {
                      localStorage.setItem("token", data.token);
                      setToken(data.token);
                      const me = await fetch("/api/auth/me", {
                        headers: { Authorization: `Bearer ${data.token}` },
                      });
                      const meData = await me.json();
                      setUser(meData.user);
                      message.success("Вход выполнен");
                    } else {
                      message.error(data.error || "Ошибка входа");
                    }
                  }}
                >
                  <Form.Item name="email" rules={[{ required: true }]}>
                    <Input placeholder="admin@sportflow.app" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true }]}>
                    <Input.Password placeholder="admin123" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Войти
                    </Button>
                  </Form.Item>
                </Form>
              }
              type="warning"
              showIcon
            />
          </div>
        )}

        <Tabs
          defaultActiveKey="manage"
          items={[
            {
              key: "manage",
              label: "Спортсмены",
              children: (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <motion.div
                      className="rounded-lg border p-4 bg-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h2 className="font-semibold mb-4">Создать спортсмена</h2>
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={(values) =>
                          createMutation.mutate({
                            firstName: values.firstName,
                            lastName: values.lastName,
                            sport: values.sport,
                            age: Number(values.age),
                            team: values.team || undefined,
                            avatarUrl: values.avatarUrl || undefined,
                            metrics: {
                              speed:
                                values.speed != null
                                  ? Number(values.speed)
                                  : undefined,
                              endurance:
                                values.endurance != null
                                  ? Number(values.endurance)
                                  : undefined,
                              strength:
                                values.strength != null
                                  ? Number(values.strength)
                                  : undefined,
                            },
                          })
                        }
                      >
                        <Form.Item
                          name="firstName"
                          label="Имя"
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Иван" />
                        </Form.Item>
                        <Form.Item
                          name="lastName"
                          label="Фамилия"
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Иванов" />
                        </Form.Item>
                        <Form.Item
                          name="sport"
                          label="Вид спорта"
                          rules={[{ required: true }]}
                        >
                          <Select
                            options={[
                              "Лёгкая атлетика",
                              "Футбол",
                              "Баскетбол",
                              "Плавание",
                              "Теннис",
                            ].map((v) => ({ value: v, label: v }))}
                          />
                        </Form.Item>
                        <Form.Item
                          name="age"
                          label="Возраст"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={8} max={80} className="w-full" />
                        </Form.Item>
                        <Form.Item name="team" label="Команда">
                          <Input placeholder="Команда или клуб" />
                        </Form.Item>
                        <Form.Item name="avatarUrl" label="Фото (URL)">
                          <Input placeholder="https://... или загрузите файл ниже" />
                        </Form.Item>
                        <Form.Item label="Загрузка фото">
                          <Upload
                            name="file"
                            action="/api/upload"
                            accept="image/*"
                            showUploadList={false}
                            headers={authHeaders as any}
                            onChange={(info) => {
                              if (info.file.status === "done") {
                                const url = info.file.response?.url;
                                if (url) {
                                  form.setFieldsValue({ avatarUrl: url });
                                  message.success("Фото загружено");
                                }
                              } else if (info.file.status === "error") {
                                message.error("Ошибка загрузки");
                              }
                            }}
                          >
                            <Button>Загрузить фото</Button>
                          </Upload>
                        </Form.Item>
                        <Form.Item label="Загрузка видео">
                          <Upload
                            name="file"
                            action="/api/upload"
                            accept="video/*"
                            showUploadList={false}
                            headers={authHeaders as any}
                            onChange={(info) => {
                              if (info.file.status === "done") {
                                const url = info.file.response?.url;
                                if (url) {
                                  form.setFieldsValue({ videoUrl: url });
                                  message.success("Видео загружено");
                                }
                              } else if (info.file.status === "error") {
                                message.error("Ошибка загрузки");
                              }
                            }}
                          >
                            <Button>Загрузить видео</Button>
                          </Upload>
                        </Form.Item>
                        <div className="grid grid-cols-3 gap-3">
                          <Form.Item name="speed" label="Скорость">
                            <InputNumber min={0} max={15} className="w-full" />
                          </Form.Item>
                          <Form.Item name="endurance" label="Вынослив.">
                            <InputNumber min={0} max={100} className="w-full" />
                          </Form.Item>
                          <Form.Item name="strength" label="Сила">
                            <InputNumber min={0} max={100} className="w-full" />
                          </Form.Item>
                        </div>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={createMutation.isPending}
                          className="mt-2"
                        >
                          Создать
                        </Button>
                      </Form>
                    </motion.div>
                  </div>
                  <div className="lg:col-span-2">
                    <motion.div
                      className="rounded-lg border p-2 bg-card overflow-x-auto"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={items}
                        loading={isLoading}
                        pagination={{ pageSize: 8 }}
                        expandable={{
                          expandedRowRender: (a: Athlete) => (
                            <div className="space-y-2">
                              {a.avatarUrl && (
                                <img
                                  src={a.avatarUrl}
                                  alt="avatar"
                                  className="h-24 rounded"
                                />
                              )}
                              {a.videoUrl && (
                                <video
                                  src={a.videoUrl}
                                  className="w-full"
                                  controls
                                />
                              )}
                            </div>
                          ),
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              ),
            },
            {
              key: "roles",
              label: "Роли и доступ",
              children: (
                <div className="rounded-lg border p-6 bg-card">
                  <p className="text-foreground/70">
                    Здесь настраиваются роли пользователей (админ, тренер,
                    спортсмен) и права доступа к разделам системы. Настроим
                    после подключения аутентификации.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </div>
      <SportsBall className="fixed right-6 bottom-6" />
    </div>
  );
}
