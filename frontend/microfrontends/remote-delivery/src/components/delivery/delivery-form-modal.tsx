import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { User, Phone, Truck, Loader2 } from 'lucide-react'
import { deliveryApi } from '@/lib/api'
import type { DeliveryPerson } from '@/types'
import { toast } from 'sonner'

interface DeliveryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person?: DeliveryPerson | null
  onSuccess?: () => void
}

const vehicleOptions = [
  { value: 'motorcycle', label: 'Motocicleta' },
  { value: 'bicycle', label: 'Bicicleta' },
  { value: 'car', label: 'Carro' },
]

export function DeliveryFormModal({ open, onOpenChange, person, onSuccess }: DeliveryFormModalProps) {
  const isEditing = !!person
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleType, setVehicleType] = useState('motorcycle')
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (person) {
      setName(person.name || '')
      setPhone(person.phone || '')
      setVehicleType(person.vehicleType || person.vehicle_type || 'motorcycle')
      setIsActive(person.isActive ?? person.is_active ?? true)
    } else {
      setName('')
      setPhone('')
      setVehicleType('motorcycle')
      setIsActive(true)
    }
  }, [person, open])

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits.length ? `(${digits}` : ''
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const canSubmit = name.trim().length >= 3 && phone.trim().length >= 14

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      if (isEditing && person) {
        await deliveryApi.update(person.id, {
          name: name.trim(),
          phone: phone.trim(),
          vehicleType: vehicleType as any,
        })
        toast.success('Entregador atualizado com sucesso!')
      } else {
        await deliveryApi.create({
          name: name.trim(),
          phone: phone.trim(),
          vehicleType: vehicleType as any,
        })
        toast.success('Entregador criado com sucesso!')
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar entregador')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Entregador' : 'Novo Entregador'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do entregador.' : 'Preencha os dados para cadastrar um novo entregador.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><User className="h-3.5 w-3.5" /> Nome *</Label>
            <Input placeholder="Ex: Carlos Santos" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5" /> Telefone *</Label>
            <Input placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} maxLength={15} className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><Truck className="h-3.5 w-3.5" /> Tipo de Veículo *</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {vehicleOptions.map((v) => (<SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label>Entregador Ativo</Label>
                <p className="text-xs text-muted-foreground">Entregadores inativos não recebem pedidos</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="gap-2 gold-gradient text-primary-foreground">
              {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>) : (isEditing ? 'Salvar Alterações' : 'Criar Entregador')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}