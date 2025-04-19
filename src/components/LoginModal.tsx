
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogIn, User } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entrar no Plushify</DialogTitle>
          <DialogDescription>
            Faça login para acessar sua conta e gerenciar seu negócio.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <User className="mr-2 h-4 w-4" />
            Entrar com Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou continue com e-mail
              </span>
            </div>
          </div>
          <Button className="w-full bg-plush-600 hover:bg-plush-700 text-white">
            <LogIn className="mr-2 h-4 w-4" />
            Entrar com E-mail
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
