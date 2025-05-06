
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, CalendarDays, Search } from "lucide-react";

type TransactionType = {
  id: string;
  created_at: string;
  product_name: string;
  quantity: number;
  type: "entrada" | "saida";
  notes: string | null;
};

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "entrada" | "saida">("all");
  const { user } = useAuth();
  
  const pageSize = 10;

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, page, filter, searchTerm]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Primeiro vamos contar o total de registros para a paginação
      let countQuery = supabase
        .from('inventory_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      // Aplicar filtro por tipo se necessário
      if (filter !== "all") {
        countQuery = countQuery.eq('type', filter);
      }
      
      // Aplicar pesquisa se houver termo
      if (searchTerm) {
        // Esta é uma consulta mais complexa que precisará ser adaptada
        // para procurar em produtos relacionados
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      setTotalPages(Math.ceil((count || 0) / pageSize));
      
      // Agora vamos buscar os dados com paginação
      let query = supabase
        .from('inventory_transactions')
        .select(`
          id,
          created_at,
          quantity,
          type,
          notes,
          products!inner(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      // Aplicar filtro por tipo
      if (filter !== "all") {
        query = query.eq('type', filter);
      }
      
      // Aplicar pesquisa se houver termo
      if (searchTerm) {
        query = query.textSearch('products.name', searchTerm);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transformar os dados para o formato que queremos exibir
      const formattedData = data?.map(item => ({
        id: item.id,
        created_at: item.created_at,
        product_name: item.products.name,
        quantity: item.quantity,
        type: item.type as "entrada" | "saida",
        notes: item.notes
      })) || [];
      
      setTransactions(formattedData);
    } catch (error: any) {
      toast.error("Erro ao carregar histórico: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: "all" | "entrada" | "saida") => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-pink-600" />
          <h2 className="text-xl font-semibold">Histórico de Transações</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("all")}
            className={filter === "all" ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            Todos
          </Button>
          <Button
            variant={filter === "entrada" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("entrada")}
            className={filter === "entrada" ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            <ArrowDown className="mr-1 h-4 w-4" />
            Entradas
          </Button>
          <Button
            variant={filter === "saida" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("saida")}
            className={filter === "saida" ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            <ArrowUp className="mr-1 h-4 w-4" />
            Saídas
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Buscar por nome do produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Histórico de transações de estoque</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead className="hidden md:table-cell">Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm", { locale: pt })}
                  </TableCell>
                  <TableCell>{transaction.product_name}</TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.type === "entrada" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {transaction.type === "entrada" ? (
                        <>
                          <ArrowDown className="h-3 w-3" />
                          Entrada
                        </>
                      ) : (
                        <>
                          <ArrowUp className="h-3 w-3" />
                          Saída
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {transaction.notes || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Lógica para mostrar páginas ao redor da página atual
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink 
                    isActive={pageNumber === page}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

