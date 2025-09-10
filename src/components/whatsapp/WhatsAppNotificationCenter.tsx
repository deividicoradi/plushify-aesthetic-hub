import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  BellRing,
  X,
  Check,
  AlertTriangle,
  Wifi,
  WifiOff,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'session_lost' | 'disconnected' | 'new_message' | 'qr_expired' | 'connection_error' | 'success';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export default function WhatsAppNotificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar notificações
  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      // Simular carregamento de notificações do banco ou localStorage
      const stored = localStorage.getItem(`whatsapp_notifications_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Adicionar notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Manter apenas 50
    setUnreadCount(prev => prev + 1);

    // Salvar no localStorage
    if (user) {
      const updated = [newNotification, ...notifications.slice(0, 49)];
      localStorage.setItem(`whatsapp_notifications_${user.id}`, JSON.stringify(updated));
    }

    // Mostrar toast
    toast({
      title: notification.title,
      description: notification.description,
      variant: notification.type === 'success' ? 'default' : 'destructive',
    });
  };

  // Marcar como lida
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Atualizar localStorage
    if (user) {
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(`whatsapp_notifications_${user.id}`, JSON.stringify(updated));
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Atualizar localStorage
    if (user) {
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem(`whatsapp_notifications_${user.id}`, JSON.stringify(updated));
    }
  };

  // Limpar notificações
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);

    if (user) {
      localStorage.removeItem(`whatsapp_notifications_${user.id}`);
    }
  };

  // Monitorar mudanças no status da sessão
  useEffect(() => {
    if (!user) {
      // Limpar notificações se não houver usuário
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const channel = supabase
      .channel('whatsapp_session_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;

          if (oldStatus !== newStatus) {
            switch (newStatus) {
              case 'desconectado':
                if (oldStatus === 'conectado') {
                  addNotification({
                    type: 'session_lost',
                    title: 'Sessão Perdida',
                    description: 'Sua conexão com o WhatsApp foi perdida. Reconecte para continuar.'
                  });
                }
                break;
              case 'conectado':
                addNotification({
                  type: 'success',
                  title: 'WhatsApp Conectado',
                  description: 'Sua sessão foi estabelecida com sucesso!'
                });
                break;
              case 'expirado':
                addNotification({
                  type: 'qr_expired',
                  title: 'QR Code Expirado',
                  description: 'O QR Code expirou. Gere um novo para conectar.'
                });
                break;
            }
          }
        }
      )
      .subscribe();

    // Monitorar novas mensagens
    const messagesChannel = supabase
      .channel('whatsapp_messages_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new?.direction === 'received') {
            addNotification({
              type: 'new_message',
              title: 'Nova Mensagem',
              description: `Mensagem recebida de ${payload.new.contact_name || payload.new.contact_phone}`,
              data: { messageId: payload.new.id }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  // Carregar notificações ao montar
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'session_lost':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'qr_expired':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'connection_error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-blue-600 animate-pulse" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 text-white border-white animate-scale-in"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 shadow-lg border animate-fade-in z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Notificações</CardTitle>
                {unreadCount > 0 && (
                  <CardDescription>
                    {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={clearNotifications}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1 p-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer
                        transition-all duration-200 hover:bg-muted/50
                        ${!notification.read 
                          ? 'bg-blue-50/50 border-blue-200' 
                          : 'bg-background border-border'
                        }
                      `}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-none ${
                            !notification.read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}