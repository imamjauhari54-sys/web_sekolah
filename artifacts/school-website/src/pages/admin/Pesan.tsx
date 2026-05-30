import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import {
  useListContactMessages,
  useDeleteContactMessage,
  getListContactMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPesan() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: messages, isLoading } = useListContactMessages();
  const deleteMessage = useDeleteContactMessage();

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMessage.mutate({ id: deleteId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListContactMessagesQueryKey() });
        toast({ title: "Pesan dihapus" });
        setDeleteId(null);
        if (expanded === deleteId) setExpanded(null);
      },
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Pesan Masuk</h1>
        <p className="text-sm text-muted-foreground">{messages?.length ?? 0} pesan diterima</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : messages?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada pesan masuk.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages?.map((msg) => (
            <motion.div
              key={msg.id}
              data-testid={`admin-message-${msg.id}`}
              layout
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{msg.name[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{msg.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</span>
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">{msg.subject}</div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />{msg.email}
                    </span>
                    {msg.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />{msg.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    data-testid={`button-expand-msg-${msg.id}`}
                    onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  >
                    {expanded === msg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    data-testid={`button-delete-msg-${msg.id}`}
                    onClick={() => setDeleteId(msg.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded message */}
              <AnimatePresence>
                {expanded === msg.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 ml-14">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{msg.message}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                          data-testid={`button-reply-msg-${msg.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                        >
                          <Mail className="w-3 h-3" /> Balas via Email
                        </a>
                        {msg.phone && (
                          <a
                            href={`https://wa.me/${msg.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            data-testid={`button-whatsapp-msg-${msg.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <Trash2 className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-bold mb-2">Hapus Pesan?</h3>
              <p className="text-sm text-muted-foreground mb-5">Pesan akan dihapus permanen.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
                <Button variant="destructive" className="flex-1" data-testid="button-confirm-delete-msg" onClick={confirmDelete} disabled={deleteMessage.isPending}>
                  {deleteMessage.isPending ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
