import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Athlete, ListResponse } from "@shared/api";
import { Table, Form, Input, InputNumber, Select, Button, Space, Popconfirm, Avatar, Tabs, Tag, Upload, message, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";

async function fetchAthletes(): Promise<ListResponse<Athlete>> {
  const r = await fetch("/api/athletes");
  if (!r.ok) throw new Error("Failed to fetch athletes");
  return r.json();
}

export default function Admin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["athletes"], queryFn: fetchAthletes });
  const items = data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Athlete>) => {
      const r = await fetch("/api/athletes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error("Create failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Athlete> }) => {
      const r = await fetch(`/api/athletes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      if (!r.ok) throw new Error("Update failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/athletes/${id}`, { method: "DELETE" });
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
            <Avatar src={a.avatarUrl} style={{ backgroundColor: "#87d068" }}>{a.firstName[0]}</Avatar>
            <div>
              <div className="font-semibold">{a.firstName} {a.lastName}</div>
              <div className="text-foreground/60 text-xs">{a.team ?? "Индивидуально"}</div>
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
            {a.metrics?.speed != null && <Tag color="green">Скорость: {a.metrics.speed}</Tag>}
            {a.metrics?.endurance != null && <Tag color="blue">Выносливость: {a.metrics.endurance}</Tag>}
            {a.metrics?.strength != null && <Tag color="gold">Сила: {a.metrics.strength}</Tag>}
          </div>
        ),
      },
      {
        title: "Действия",
        key: "actions",
        width: 180,
        render: (_: any, a: Athlete) => (
          <Space>
            <Button size="small" onClick={() => updateMutation.mutate({ id: a.id, patch: { team: a.team ? undefined : "Команда A" } })}>Тег команда</Button>
            <Popconfirm title="Удалить?" onConfirm={() => deleteMutation.mutate(a.id)}>
              <Button size="small" danger>Удалить</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, updateMutation],
  );

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Админ-панель</h1>
        <Button onClick={async () => { const r = await fetch('/api/seed', { method: 'POST' }); r.ok ? message.success('Данные загружены') : message.error('Ошибка импорта'); qc.invalidateQueries({ queryKey: ['athletes'] }); }}>Загрузить демо-данные</Button>
      </div>

      <Tabs
        defaultActiveKey="manage"
        items={[
          {
            key: "manage",
            label: "Спортсмены",
            children: (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="rounded-lg border p-4 bg-card">
                    <h2 className="font-semibold mb-4">Создать спортсмена</h2>
                    <Form form={form} layout="vertical" onFinish={(values) => createMutation.mutate({
                      firstName: values.firstName,
                      lastName: values.lastName,
                      sport: values.sport,
                      age: Number(values.age),
                      team: values.team || undefined,
                      avatarUrl: values.avatarUrl || undefined,
                      metrics: {
                        speed: values.speed != null ? Number(values.speed) : undefined,
                        endurance: values.endurance != null ? Number(values.endurance) : undefined,
                        strength: values.strength != null ? Number(values.strength) : undefined,
                      },
                    })}>
                      <Form.Item name="firstName" label="Имя" rules={[{ required: true }]}>
                        <Input placeholder="Иван" />
                      </Form.Item>
                      <Form.Item name="lastName" label="Фамилия" rules={[{ required: true }]}>
                        <Input placeholder="Иванов" />
                      </Form.Item>
                      <Form.Item name="sport" label="Вид спорта" rules={[{ required: true }]}>
                        <Select options={["Лёгкая атлетика","Футбол","Баскетбол","Плавание","Теннис"].map(v => ({ value: v, label: v }))} />
                      </Form.Item>
                      <Form.Item name="age" label="Возраст" rules={[{ required: true }]}>
                        <InputNumber min={8} max={80} className="w-full" />
                      </Form.Item>
                      <Form.Item name="team" label="Команда">
                        <Input placeholder="Команда или клуб" />
                      </Form.Item>
                      <Form.Item name="avatarUrl" label="Фото (URL)">
                        <Input placeholder="https://... или загрузите файл ниже" />
                      </Form.Item>
                      <Form.Item label="Загрузка фото">
                        <Upload name="file" action="/api/upload" accept="image/*" showUploadList={false}
                          onChange={(info) => {
                            if (info.file.status === 'done') {
                              const url = info.file.response?.url;
                              if (url) {
                                form.setFieldsValue({ avatarUrl: url });
                                message.success('Фото загружено');
                              }
                            } else if (info.file.status === 'error') {
                              message.error('Ошибка загрузки');
                            }
                          }}>
                          <Button>Загрузить фото</Button>
                        </Upload>
                      </Form.Item>
                      <Form.Item label="Загрузка видео">
                        <Upload name="file" action="/api/upload" accept="video/*" showUploadList={false}
                          onChange={(info) => {
                            if (info.file.status === 'done') {
                              const url = info.file.response?.url;
                              if (url) {
                                form.setFieldsValue({ videoUrl: url });
                                message.success('Видео загружено');
                              }
                            } else if (info.file.status === 'error') {
                              message.error('Ошибка загрузки');
                            }
                          }}>
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
                      <Button type="primary" htmlType="submit" loading={createMutation.isPending} className="mt-2">Создать</Button>
                    </Form>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="rounded-lg border p-2 bg-card">
                    <Table rowKey="id" columns={columns} dataSource={items} loading={isLoading} pagination={{ pageSize: 8 }}
                      expandable={{
                        expandedRowRender: (a: Athlete) => (
                          <div className="space-y-2">
                            {a.avatarUrl && <img src={a.avatarUrl} alt="avatar" className="h-24 rounded" />}
                            {a.videoUrl && (
                              <video src={a.videoUrl} className="w-full" controls />
                            )}
                          </div>
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>
            ),
          },
          { key: "roles", label: "Роли и доступ", children: (
            <div className="rounded-lg border p-6 bg-card">
              <p className="text-foreground/70">Здесь настраиваются роли пользователей (админ, тренер, спортсмен) и права доступа к разделам системы. Настроим после подключения аутентификации.</p>
            </div>
          ) },
        ]}
      />
    </div>
  );
}
