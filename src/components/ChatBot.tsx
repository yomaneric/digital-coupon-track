import { useState, useRef, useEffect } from 'react'
import { X, PaperPlaneRight, Robot, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import type { CouponFormData } from '@/lib/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatBotProps {
  isOpen: boolean
  onClose: () => void
  onAddCoupon: (data: CouponFormData) => void
  onUpdateCoupon: (id: string, data: CouponFormData) => void
  onDeleteCoupon: (id: string) => void
  coupons: Array<{
    id: string
    merchant: string
    value: string
    code?: string
    url?: string
    expiresAt?: number
  }>
}

export function ChatBot({
  isOpen,
  onClose,
  onAddCoupon,
  onUpdateCoupon,
  onDeleteCoupon,
  coupons,
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your Coupon Assistant with CLI-like capabilities. I can help you create, update, or delete coupons using natural language. Just tell me what you'd like to do!",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        content,
        timestamp: Date.now(),
      },
    ])
  }

  const processCommand = async (userInput: string) => {
    setIsProcessing(true)
    addMessage('user', userInput)

    try {
      const conversationHistory = messages
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')

      const promptText = (window.spark.llmPrompt as any)`You are a CLI-like assistant for a coupon management app. Analyze the user's request and generate a structured command.

Current coupons in the system:
${JSON.stringify(coupons, null, 2)}

Previous conversation (last 10 messages):
${conversationHistory}

Current user request: "${userInput}"

Your task:
1. Determine the action: create, create_batch, update, delete, or list coupons
2. Extract parameters from the user's request
3. If information is missing, respond with a question asking for the missing details
4. Return a JSON response with this structure:

For CREATE (single coupon):
{
  "action": "create",
  "params": {
    "merchant": "string (required)",
    "value": "string (required)",
    "variants": [
      {
        "code": "string (optional)",
        "url": "string (optional)",
        "expiresAt": "timestamp in milliseconds (optional)"
      }
    ]
  },
  "missingFields": ["field1", "field2"],
  "message": "User-friendly message explaining what will be done or what's needed"
}

For CREATE_BATCH (multiple coupons with same merchant/value but different URLs/codes):
{
  "action": "create_batch",
  "params": {
    "merchant": "string (required)",
    "value": "string (required)",
    "variants": [
      {
        "code": "string (optional)",
        "url": "string (optional)",
        "expiresAt": "timestamp in milliseconds (optional)"
      },
      {
        "code": "string (optional)",
        "url": "string (optional)",
        "expiresAt": "timestamp in milliseconds (optional)"
      }
    ]
  },
  "missingFields": [],
  "message": "User-friendly message"
}

For UPDATE:
{
  "action": "update",
  "params": {
    "id": "coupon id or merchant name to identify",
    "merchant": "string (optional)",
    "value": "string (optional)",
    "code": "string (optional)",
    "url": "string (optional)",
    "expiresAt": "timestamp in milliseconds (optional)"
  },
  "missingFields": ["field1"],
  "message": "User-friendly message"
}

For DELETE:
{
  "action": "delete",
  "params": {
    "id": "coupon id or merchant name to identify"
  },
  "missingFields": [],
  "message": "User-friendly message"
}

For LIST:
{
  "action": "list",
  "params": {},
  "missingFields": [],
  "message": "Here are your current coupons: [summary]"
}

For HELP or UNCLEAR:
{
  "action": "help",
  "params": {},
  "missingFields": [],
  "message": "Helpful message explaining what the user can do"
}

Important rules:
- For dates, convert natural language (like "22 Nov 2026", "December 31, 2024" or "in 30 days") to timestamps in milliseconds
- If user provides multiple URLs or codes for the same merchant, use "create_batch" action with multiple variants
- If the user mentions a merchant name that exists, use that coupon's ID for updates/deletes
- Be helpful and conversational but structured
- Always return valid JSON
- Extract ALL URLs from the user's input and put them in separate variant objects`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(response)

      if (parsed.missingFields && parsed.missingFields.length > 0) {
        addMessage('assistant', parsed.message)
      } else {
        await executeCommand(parsed)
      }
    } catch (error) {
      console.error('Error processing command:', error)
      addMessage(
        'assistant',
        "Sorry, I had trouble understanding that. Could you try rephrasing your request? For example: 'Create a coupon for Amazon with 20% off' or 'Delete the Target coupon'."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const executeCommand = async (command: any) => {
    try {
      switch (command.action) {
        case 'create': {
          const couponData: CouponFormData = {
            merchant: command.params.merchant,
            value: command.params.value,
            variants: command.params.variants || [{
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              code: command.params.code,
              url: command.params.url,
              expiresAt: command.params.expiresAt,
              createdAt: Date.now(),
            }],
          }
          onAddCoupon(couponData)
          addMessage(
            'assistant',
            command.message ||
              `✓ Successfully created coupon for ${command.params.merchant} with value ${command.params.value}!`
          )
          break
        }

        case 'create_batch': {
          const variants = command.params.variants.map((v: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            code: v.code,
            url: v.url,
            expiresAt: v.expiresAt,
            createdAt: Date.now(),
          }))

          const couponData: CouponFormData = {
            merchant: command.params.merchant,
            value: command.params.value,
            variants: variants,
          }
          
          onAddCoupon(couponData)
          addMessage(
            'assistant',
            command.message ||
              `✓ Successfully created ${variants.length} coupon variants for ${command.params.merchant}!`
          )
          break
        }

        case 'update': {
          let targetId = command.params.id
          
          if (!targetId || !coupons.find(c => c.id === targetId)) {
            const coupon = coupons.find(
              (c) =>
                c.merchant.toLowerCase() === command.params.id?.toLowerCase()
            )
            if (coupon) {
              targetId = coupon.id
            } else {
              addMessage(
                'assistant',
                `I couldn't find a coupon matching "${command.params.id}". Here are your current coupons: ${coupons.map((c) => c.merchant).join(', ')}`
              )
              return
            }
          }

          const existingCoupon = coupons.find((c) => c.id === targetId)
          
          const firstVariant = existingCoupon ? {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            code: command.params.code !== undefined ? command.params.code : existingCoupon.code,
            url: command.params.url !== undefined ? command.params.url : existingCoupon.url,
            expiresAt: command.params.expiresAt !== undefined ? command.params.expiresAt : existingCoupon.expiresAt,
            createdAt: Date.now(),
          } : {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            code: command.params.code,
            url: command.params.url,
            expiresAt: command.params.expiresAt,
            createdAt: Date.now(),
          }

          const mergedData: CouponFormData = {
            merchant: command.params.merchant || existingCoupon?.merchant || '',
            value: command.params.value || existingCoupon?.value || '',
            variants: [firstVariant],
          }

          onUpdateCoupon(targetId, mergedData)
          addMessage(
            'assistant',
            command.message || `✓ Successfully updated the coupon!`
          )
          break
        }

        case 'delete': {
          let targetId = command.params.id
          const coupon = coupons.find(
            (c) =>
              c.id === targetId ||
              c.merchant.toLowerCase() === command.params.id?.toLowerCase()
          )

          if (!coupon) {
            addMessage(
              'assistant',
              `I couldn't find a coupon matching "${command.params.id}". Here are your current coupons: ${coupons.map((c) => c.merchant).join(', ')}`
            )
            return
          }

          onDeleteCoupon(coupon.id)
          addMessage(
            'assistant',
            command.message ||
              `✓ Successfully deleted the ${coupon.merchant} coupon!`
          )
          break
        }

        case 'list': {
          if (coupons.length === 0) {
            addMessage('assistant', "You don't have any coupons yet. Try adding one!")
          } else {
            const list = coupons
              .map(
                (c) =>
                  `• ${c.merchant} - ${c.value}${c.code ? ` (Code: ${c.code})` : ''}`
              )
              .join('\n')
            addMessage(
              'assistant',
              `Here are your ${coupons.length} coupon(s):\n\n${list}`
            )
          }
          break
        }

        case 'help':
        default:
          addMessage('assistant', command.message)
          break
      }
    } catch (error) {
      console.error('Error executing command:', error)
      addMessage(
        'assistant',
        'Sorry, there was an error executing that command. Please try again.'
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userInput = input.trim()
    setInput('')
    processCommand(userInput)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 w-[440px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-card border-2 border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Robot className="text-primary" size={24} weight="bold" />
              </div>
              <div>
                <h2 className="font-space font-bold text-lg">Coupon Assistant</h2>
                <p className="text-xs text-muted-foreground">CLI-powered helper</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-destructive/20 hover:text-destructive"
            >
              <X size={20} weight="bold" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User size={18} weight="bold" />
                    ) : (
                      <Robot size={18} weight="bold" />
                    )}
                  </div>
                  <div
                    className={`flex-1 rounded-2xl p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0">
                    <Robot size={18} weight="bold" />
                  </div>
                  <div className="flex-1 rounded-2xl p-3 bg-muted">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background/50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your command..."
                disabled={isProcessing}
                className="flex-1 bg-background"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isProcessing}
                className="flex-shrink-0"
              >
                <PaperPlaneRight size={20} weight="bold" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Try: "Add a coupon for Target with 25% off" or "Delete Amazon coupon"
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
