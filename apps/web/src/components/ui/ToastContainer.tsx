import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"
import { useToastStore, Toast } from "@/store/toastStore"

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore()

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      case "error": return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
      case "info": return <Info className="w-4 h-4 text-blue-400 shrink-0" />
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-3 p-3.5 bg-card border border-border text-foreground rounded-lg shadow-2xl pointer-events-auto"
          >
            {getIcon(toast.type)}
            <span className="text-xs font-semibold flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
export default ToastContainer
