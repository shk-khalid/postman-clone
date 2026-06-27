import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"
import { useToastStore, Toast } from "@/store/toastStore"

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore()

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case "error": return <XCircle className="w-4 h-4 text-rose-500" />
      case "info": return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getBorderColor = (type: Toast["type"]) => {
    switch (type) {
      case "success": return "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
      case "warning": return "border-amber-500/20 bg-amber-500/5 text-amber-300"
      case "error": return "border-rose-500/20 bg-rose-500/5 text-rose-300"
      case "info": return "border-blue-500/20 bg-blue-500/5 text-blue-300"
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
            className={`flex items-center gap-3 p-3.5 border rounded-lg shadow-xl backdrop-blur pointer-events-auto ${getBorderColor(toast.type)}`}
          >
            {getIcon(toast.type)}
            <span className="text-xs font-medium flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-0.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all shrink-0"
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
