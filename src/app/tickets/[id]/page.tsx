"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  suggestedReply: string;
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  sender: "USER" | "AGENT" | "AI";
  message: string;
  createdAt: string;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicket();
    fetchMessages();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.data.ticket ?? res.data.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/tickets/${id}/messages`);
      setMessages(res.data.data.messages ?? res.data.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load messages");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${id}/messages`, {
        sender: "USER",
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/tickets/${id}`, { status });
      setTicket((prev) => (prev ? { ...prev, status } : prev));
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/20 text-red-400";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-green-500/20 text-green-400";
    }
  };

  const senderStyle = (sender: string) => {
    if (sender === "USER") return "bg-primary text-primary-foreground self-end";
    if (sender === "AI") return "bg-purple-500/20 text-purple-300 self-start";
    return "bg-muted text-foreground self-start";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Ticket not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => router.push("/tickets")}>
          ← Back to tickets
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{ticket.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {ticket.description}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Badge variant="outline">{ticket.category}</Badge>
                <Badge className={priorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.suggestedReply && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  AI Suggested Reply
                </p>
                <p className="text-sm text-foreground">
                  {ticket.suggestedReply}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select
                value={ticket.status}
                onValueChange={(value) => {
                  if (value) handleStatusChange(value);
                }}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">OPEN</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  <SelectItem value="CLOSED">CLOSED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto p-1">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No messages yet.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${senderStyle(msg.sender)}`}
                  >
                    <p className="text-[10px] opacity-70 mb-1">{msg.sender}</p>
                    <p>{msg.message}</p>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={2}
                className="resize-none"
              />
              <Button onClick={handleSendMessage} disabled={sending}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
