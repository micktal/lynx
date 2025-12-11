import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import type { Notification } from "@shared/api";
import * as builder from "../lib/builderService";

export default function NotificationsPage() {
  const currentUserId = "u_1";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const n = await builder.fetchNotificationsForUser(currentUserId);
    setNotifications(n);
    setLoading(false);
  }

  async function markAll() {
    await builder.markAllNotificationsRead(currentUserId);
    load();
  }

  async function markOne(id: string) {
    await builder.markNotificationAsRead(id);
    load();
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div>
          <button className="btn" onClick={markAll}>Marquer tout comme lu</button>
        </div>
      </div>

      <div className="card">
        <div className="p-4">
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th></th>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Lu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className="border-t">
                    <td className="py-2">🔔</td>
                    <td>{n.title}</td>
                    <td>{new Date(n.createdAt).toLocaleString()}</td>
                    <td>{n.read ? "Oui" : "Non"}</td>
                    <td>
                      <div className="flex gap-2">
                        {!n.read && <button className="btn-sm" onClick={() => markOne(n.id)}>Marquer lu</button>}
                        {n.link && (
                          <a className="btn-sm" href={n.link}>Ouvrir</a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
