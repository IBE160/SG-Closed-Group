"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Trash2, Shield, ShieldCheck, Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "OPERATOR" | "ADMINISTRATOR";
  whitelisted: boolean;
  createdAt: string;
}

export default function InnstillingerPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"OPERATOR" | "ADMINISTRATOR">("OPERATOR");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = session?.user?.role === "ADMINISTRATOR";

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/admin/whitelist");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch {
      setError("Kunne ikke hente brukerliste");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setNewEmail("");
        fetchUsers();
      } else {
        setError(data.error?.message || "Kunne ikke legge til bruker");
      }
    } catch {
      setError("Nettverksfeil");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (!confirm(`Er du sikker på at du vil fjerne ${email} fra whitelist?`)) return;

    try {
      const res = await fetch(`/api/admin/whitelist/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        setError(data.error?.message || "Kunne ikke fjerne bruker");
      }
    } catch {
      setError("Nettverksfeil");
    }
  };

  const handleRoleChange = async (email: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/whitelist/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        setError(data.error?.message || "Kunne ikke endre rolle");
      }
    } catch {
      setError("Nettverksfeil");
    }
  };

  if (!session) {
    return (
      <div className="p-4">
        <h1 className="text-emergency-heading mb-4">Innstillinger</h1>
        <p className="text-muted-foreground">Logg inn for å se innstillinger</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-emergency-heading mb-4">Innstillinger</h1>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {session.user.role === "ADMINISTRATOR" ? (
              <ShieldCheck className="h-5 w-5 text-yellow-500" />
            ) : (
              <Shield className="h-5 w-5 text-blue-500" />
            )}
            Min profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><span className="text-muted-foreground">Navn:</span> {session.user.name}</div>
          <div><span className="text-muted-foreground">E-post:</span> {session.user.email}</div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rolle:</span>
            <Badge variant={session.user.role === "ADMINISTRATOR" ? "default" : "secondary"}>
              {session.user.role === "ADMINISTRATOR" ? "Administrator" : "Operator"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Admin Panel - Only visible to administrators */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Brukeradministrasjon</CardTitle>
            <CardDescription>Administrer whitelist og brukerroller</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Add User Form */}
            <form onSubmit={handleAddUser} className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="email" className="sr-only">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="bruker@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={adding}
                />
              </div>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as "OPERATOR" | "ADMINISTRATOR")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATOR">Operator</SelectItem>
                  <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={adding || !newEmail.trim()}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Legg til</span>
              </Button>
            </form>

            {/* User List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {users.filter(u => u.whitelisted).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name || user.email}</div>
                      <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.email, v)}
                      disabled={user.email === session.user.email}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPERATOR">Operator</SelectItem>
                        <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveUser(user.email)}
                      disabled={user.email === session.user.email}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {users.filter(u => u.whitelisted).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Ingen brukere i whitelist</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isAdmin && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Kun administratorer kan administrere brukere
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
