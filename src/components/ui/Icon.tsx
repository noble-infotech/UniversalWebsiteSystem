/**
 * Config-addressable icons. Site configs reference icons by name ("factory",
 * "shield-check" …). A curated map keeps client bundles small; add names here.
 */
import {
  Award, BadgeCheck, BarChart3, Battery, Bolt, Box, Boxes, Brain, Briefcase, Building2, Calendar, Camera, Check, CheckCircle2,
  Clock, Cloud, Code2, Cog, Compass, Cpu, CreditCard, Crown, Diamond, Droplets, Factory, FlaskConical, Gauge, Gem, Gift, Globe,
  GraduationCap, Hammer, Handshake, Headphones, Heart, HeartPulse, Home, Layers, Leaf, LifeBuoy, Lightbulb, LineChart, Lock, Mail,
  MapPin, Medal, Megaphone, MessageCircle, Microscope, Package, Palette, PenTool, Phone, PieChart, Plane, Recycle, Rocket, Ruler,
  Scale, Search, Settings, Shield, ShieldCheck, ShoppingBag, Smile, Sparkles, Star, Target, Timer, TrendingUp, Trophy, Truck, Undo2,
  Users, Wallet, Warehouse, Wrench, Zap, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  award: Award, "badge-check": BadgeCheck, chart: BarChart3, battery: Battery, bolt: Bolt, box: Box, boxes: Boxes, brain: Brain,
  briefcase: Briefcase, building: Building2, calendar: Calendar, camera: Camera, check: Check, "check-circle": CheckCircle2, clock: Clock,
  cloud: Cloud, code: Code2, cog: Cog, compass: Compass, cpu: Cpu, card: CreditCard, crown: Crown, diamond: Diamond, droplets: Droplets,
  factory: Factory, flask: FlaskConical, gauge: Gauge, gem: Gem, gift: Gift, globe: Globe, graduation: GraduationCap, hammer: Hammer,
  handshake: Handshake, headphones: Headphones, heart: Heart, health: HeartPulse, home: Home, layers: Layers, leaf: Leaf, support: LifeBuoy,
  lightbulb: Lightbulb, "line-chart": LineChart, lock: Lock, mail: Mail, pin: MapPin, medal: Medal, megaphone: Megaphone, chat: MessageCircle,
  microscope: Microscope, package: Package, palette: Palette, pen: PenTool, phone: Phone, "pie-chart": PieChart, plane: Plane, recycle: Recycle,
  rocket: Rocket, ruler: Ruler, scale: Scale, search: Search, settings: Settings, shield: Shield, "shield-check": ShieldCheck, bag: ShoppingBag,
  smile: Smile, sparkles: Sparkles, star: Star, target: Target, timer: Timer, trending: TrendingUp, trophy: Trophy, truck: Truck, returns: Undo2,
  users: Users, wallet: Wallet, warehouse: Warehouse, wrench: Wrench, zap: Zap,
};

export const iconNames = Object.keys(map);

export function Icon({ name, className = "size-6", strokeWidth = 1.75 }: { name?: string; className?: string; strokeWidth?: number }) {
  const C = (name && map[name]) || Sparkles;
  return <C className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
