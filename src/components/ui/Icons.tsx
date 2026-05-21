import React from 'react';
import { View } from 'react-native';
import { Svg, Path, Circle, Rect, SvgProps } from 'react-native-svg';

import { cn } from '@/lib/cn';

// Provision for SVGR. User can replace these with their actual SVGs.

// Inline pin icon for use beside location labels (no surrounding View).
export const PinIcon = ({ color = '#6B7280', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22S20 14.5 20 10C20 5.58 16.42 2 12 2C7.58 2 4 5.58 4 10C4 14.5 12 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

// export const Logo = ({ size = 120 }: { size?: number }) => (
//   <View style={{ width: size, height: size * 0.4, alignItems: 'center', justifyContent: 'center' }}>
//     {/* Placeholder for the Logo in the image */}
//     <Svg width={size} height={size * 0.4} viewBox="0 0 200 60">
//       <Path
//         d="M30 30 L10 10 M30 30 L50 10 M30 30 L30 50"
//         stroke="#0B4A33"
//         strokeWidth="4"
//         fill="none"
//       />
//       <Circle cx="30" cy="30" r="15" stroke="#0B4A33" strokeWidth="2" fill="none" />
//       {/* Text Placeholder */}
//       <Rect x="60" y="20" width="100" height="20" fill="#0D1B1E" rx="4" />
//     </Svg>
//   </View>
// );
export const Logo = (props: SvgProps) => (
  <Svg width={129} height={32} fill="none" {...props}>
    <Path
      fill="#111827"
      d="M38.689 15.93c0-5.857 3.404-9.93 8.576-9.93 3.912 0 7.076 2.345 8.028 6.124.027.093-.013.148-.107.148H52.56a.173.173 0 0 1-.16-.106c-.803-2.266-2.76-3.577-5.132-3.577-3.524 0-5.776 2.893-5.776 7.345 0 4.45 2.266 7.384 5.87 7.384 2.826 0 5.172-1.782 5.533-6.004.014-.093-.04-.147-.12-.147h-6.097c-.08 0-.133-.053-.133-.133v-2.183c0-.08.053-.133.133-.133h8.938c.08 0 .12.04.133.12.053.414.08.83.08 1.26 0 6.34-3.646 9.81-8.47 9.81-5.252 0-8.671-4.088-8.671-9.97l.002-.009ZM57.703 18.823c0-4.276 2.72-7.01 6.66-7.01 3.7 0 6.287 2.452 6.3 6.914l-.026.777c0 .093-.053.133-.133.133H60.439c-.08 0-.147.053-.133.147.321 2.518 1.848 3.885 4.034 3.885 1.513 0 2.76-.643 3.403-2.306.027-.066.08-.106.147-.106h2.372c.093 0 .146.066.12.175-.844 3.109-3.176 4.383-6.071 4.383-4.048 0-6.606-2.734-6.606-6.997l-.002.005Zm2.8-1.367h7.398c.08 0 .146-.053.133-.146-.295-2.144-1.675-3.364-3.632-3.364-2.144 0-3.577 1.273-4.021 3.364-.013.093.026.146.12.146h.002ZM72.217 18.796c0-4.249 2.627-6.983 6.688-6.983 4.06 0 6.66 2.734 6.66 6.983 0 4.25-2.613 7.023-6.66 7.023-4.048 0-6.688-2.747-6.688-7.023Zm10.693 0c0-2.867-1.582-4.73-4.008-4.73-2.425 0-4.02 1.861-4.02 4.73 0 2.87 1.582 4.77 4.02 4.77 2.439 0 4.008-1.876 4.008-4.77ZM88.62 22.844V14.32c0-.08-.054-.134-.134-.134H85.98c-.08 0-.133-.053-.133-.133V12.22c0-.08.053-.133.133-.133h1.407c.885 0 1.366-.495 1.366-1.367V8.201c0-.08.054-.133.133-.133h2.293c.08 0 .133.053.133.133v3.752c0 .08.053.133.133.133h2.505c.08 0 .133.053.133.133v1.835c0 .08-.053.133-.133.133h-2.505c-.08 0-.133.054-.133.134v7.852c0 .817.255 1.059 1.072 1.059h1.568c.08 0 .133.053.133.133v2.05c0 .08-.053.133-.133.133h-2.627c-1.782 0-2.707-.872-2.707-2.707v.003ZM94.703 18.823c0-4.276 2.72-7.01 6.662-7.01 3.698 0 6.286 2.452 6.299 6.914l-.027.777c0 .093-.053.133-.133.133H97.439c-.08 0-.146.053-.133.147.322 2.518 1.848 3.885 4.034 3.885 1.513 0 2.76-.643 3.404-2.306.027-.066.08-.106.146-.106h2.373c.093 0 .146.066.119.175-.843 3.109-3.175 4.383-6.071 4.383-4.047 0-6.606-2.734-6.606-6.997l-.002.005Zm2.8-1.367h7.399c.079 0 .146-.053.133-.146-.296-2.144-1.676-3.364-3.633-3.364-2.143 0-3.577 1.273-4.02 3.364-.014.093.026.146.12.146h.002ZM109.55 25.418V6.468c0-.08.054-.133.134-.133h2.425c.08 0 .133.053.133.133v18.95c0 .08-.053.133-.133.133h-2.425c-.08 0-.134-.054-.134-.133ZM114.414 21.652c0-2.505 1.917-4.194 5.053-4.194h4.637c.08 0 .133-.053.133-.133v-.71c0-1.715-1.111-2.667-3.27-2.667-1.822 0-2.963.736-3.324 2.183-.014.08-.067.12-.147.12h-2.412c-.079 0-.133-.053-.119-.146.454-2.694 2.56-4.29 5.991-4.29 3.619 0 5.895 1.809 5.895 5.026v5.936c0 .415.202.63.617.63h.617c.08 0 .133.053.133.133v1.878c0 .08-.053.133-.133.133h-1.649c-1.071 0-1.742-.362-1.997-1.165-.026-.107-.079-.133-.119-.08-.913 1.018-2.319 1.513-4.263 1.513-3.47 0-5.643-1.569-5.643-4.167Zm9.877-1.582v-.295c0-.08-.054-.133-.134-.133h-4.475c-1.622 0-2.574.723-2.574 1.943 0 1.287 1.112 2.09 3.202 2.09 2.587 0 3.981-1.273 3.981-3.605Z"
    />
    <Path
      fill="#06773C"
      d="M21.675 25.983c-.144.665-.29 1.32-.432 1.98-.143.651-.28 1.305-.423 1.957-.145.656-.284 1.312-.433 1.98-.061-.042-.07-.093-.09-.137-.381-.873-.764-1.744-1.145-2.618l-1.414-3.23c-.006-.016-.017-.03-.021-.046-.022-.09-.086-.123-.172-.14a13.21 13.21 0 0 1-1.126-.293 15.374 15.374 0 0 1-5.475-2.995 15.279 15.279 0 0 1-3.597-4.385 12.847 12.847 0 0 1-1.301-3.447c-.04-.178-.07-.358-.105-.538-.005-.029-.014-.055-.022-.092-.49-.2-.983-.386-1.477-.582-.494-.195-.988-.386-1.482-.581l-1.48-.58c-.495-.193-.988-.384-1.48-.58.009-.052.044-.04.066-.045a96.02 96.02 0 0 1 1.148-.198c.572-.098 1.147-.195 1.72-.294l1.705-.29 1.231-.21c.022-.005.042-.013.07-.024l.053-.233c.358-1.716 1.146-3.204 2.399-4.437.93-.915 2.023-1.574 3.248-2.017a10.472 10.472 0 0 1 2.175-.522 12.577 12.577 0 0 1 1.948-.097h.172c.01 0 .021-.006.043-.013.029-.046.044-.108.062-.165l.954-2.964c.018-.053.038-.104.055-.152.018 0 .022 0 .027.002a.058.058 0 0 1 .013.011l.018.029a5684.374 5684.374 0 0 0 1.846 3.689.12.12 0 0 0 .017.028l.008.014.02.021.184.058a15.848 15.848 0 0 1 5.283 2.751 15.352 15.352 0 0 1 3.533 3.883 13.178 13.178 0 0 1 1.365 2.848c.046.138.046.138.184.2 1.295.57 2.59 1.141 3.885 1.714.054.024.116.04.173.096-.171.075-.345.104-.513.15-.176.05-.354.094-.53.142l-.513.136c-.171.046-.342.092-.514.136l-.513.136c-.176.046-.353.095-.529.143-.169.046-.342.081-.515.145-.003.041-.007.081-.007.118.004.121.015.24.017.36.011.41-.01.821-.048 1.232a8.748 8.748 0 0 1-.334 1.711c-.63 2.072-1.878 3.667-3.713 4.808-.954.595-1.99.988-3.087 1.227-.347.075-.696.132-1.047.174-.022.002-.044.008-.088.017l.005.009ZM16.438 5.196a8.773 8.773 0 0 0-1.325.108 7.891 7.891 0 0 0-2.112.62c-1.347.617-2.41 1.552-3.153 2.84-.615 1.067-.904 2.226-.937 3.45-.018.648.05 1.288.182 1.923.193.932.522 1.819.963 2.662 1.504 2.87 4.21 5.11 7.313 6.052.827.25 1.672.417 2.534.472.691.042 1.38.02 2.065-.088a8.117 8.117 0 0 0 2.544-.827c2.071-1.093 3.485-3.07 3.671-5.655a8.857 8.857 0 0 0-.318-3.016 10.389 10.389 0 0 0-1.657-3.397c-1.474-2.014-3.386-3.467-5.708-4.378a10.85 10.85 0 0 0-4.066-.764l.004-.002Z"
    />
    <Path
      fill="#FF812D"
      d="M17.84 8.143c1.033 0 1.93.196 2.793.556a8.16 8.16 0 0 1 3.588 2.842c.51.713.871 1.496 1.075 2.35.136.57.194 1.148.147 1.734-.155 1.966-1.363 3.256-2.817 3.842-.496.2-1.01.32-1.541.371-1.163.108-2.276-.099-3.342-.55-1.82-.773-3.187-2.037-4.084-3.802a6.11 6.11 0 0 1-.59-1.797c-.16-.98-.08-1.935.33-2.848.492-1.093 1.313-1.85 2.417-2.305a5.311 5.311 0 0 1 2.028-.393h-.005Zm2.005 8.763c.02-.024.033-.037.04-.05.686-1.587 1.373-3.171 2.06-4.758 0-.004.003-.011 0-.018 0-.004-.006-.008-.009-.01-.01-.003-.021-.01-.032-.007-1.824.485-3.648.968-5.474 1.455-.021.006-.04.017-.079.035.062.033.11.061.16.086.663.32 1.326.638 1.989.959.041.02.083.037.123.061a.318.318 0 0 1 .083.079c.026.037.044.079.066.12.33.633.658 1.267.988 1.899l.085.151v-.002Z"
    />
  </Svg>
);

export const ArrowRight = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CalendarIcon = ({
  color = '#6B7280',
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const EyeIcon = ({ color = '#6B7280', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

export const BackIcon = ({ color = '#0D1B1E', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

export const EmailIcon = ({ color = '#E85A2D', size = 32 }: { color?: string; size?: number }) => (
  <View className="h-16 w-16 items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 6L12 13L2 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3" fill="#E85A2D" />
      <Path
        d="M10.5 13L11.5 14L13.5 12"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export const InvestorIcon = ({ size = 24, color = 'white' }: { size?: number; color?: string }) => (
  <View className="h-12 w-12 items-center justify-center rounded-xl bg-brand">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 6L13.5 15.5L8.5 10.5L1 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 6H23V12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export const ExplorerIcon = ({ size = 24, color = 'white' }: { size?: number; color?: string }) => (
  <View className="h-12 w-12 items-center justify-center rounded-xl bg-accent">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path
        d="M16.2 7.8L13.5 13.5L7.8 16.2L10.5 10.5L16.2 7.8Z"
        stroke={color}
        strokeWidth="2"
        fill={color}
      />
    </Svg>
  </View>
);

export const SelectedCheckIcon = ({ size = 24 }: { size?: number }) => (
  <View className="h-7 w-7 items-center justify-center rounded-full bg-brand">
    <Svg width={size - 8} height={size - 8} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export const MapTabIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 6V22L8 18L15 22L22 18V2L15 6L8 2L1 6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.2 : 0}
    />
    <Path
      d="M8 2V18M15 6V22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FeedTabIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 4H21V11H3V4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 15H21V20H3V15Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 11H8M3 20H8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SavedTabIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
    />
  </Svg>
);

export const UserTabIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BellIcon = ({ color = '#0D1B1E', size = 24 }: { color?: string; size?: number }) => (
  <View className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-card">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
    <View className="absolute right-3 top-3 h-2 w-2 rounded-full border border-white bg-accent" />
  </View>
);

export const SearchIcon = ({ color = '#6B7280', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const MapZoomInIcon = ({
  color = '#0D1B1E',
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <View className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-card shadow-sm">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  </View>
);

export const MapZoomOutIcon = ({
  color = '#0D1B1E',
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <View className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-card shadow-sm">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  </View>
);

export const MapCompassIcon = ({
  color = '#0D1B1E',
  size = 24,
}: {
  color?: string;
  size?: number;
}) => (
  <View className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-card shadow-sm">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path
        d="M12 2V6M12 18V22M2 12H6M18 12H22M16.24 7.76L13.41 10.59M10.59 13.41L7.76 16.24"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

export const MapLocationIcon = ({
  color = 'white',
  size = 24,
}: {
  color?: string;
  size?: number;
}) => (
  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" fill={color} />
      <Path
        d="M12 2V4M12 20V22M2 12H4M20 12H22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
    </Svg>
  </View>
);
export const BookmarkIcon = ({
  focused,
  color = '#0D1B1E',
  size = 20,
}: {
  focused?: boolean;
  color?: string;
  size?: number;
}) => (
  <View
    className={cn(
      'h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card shadow-sm',
      focused && 'border-brand/20 bg-brand/10',
    )}
  >
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
        stroke={focused ? '#0E5A3A' : color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? '#0E5A3A' : 'none'}
      />
    </Svg>
  </View>
);

export const ShareIcon = ({ color = '#0D1B1E', size = 20 }: { color?: string; size?: number }) => (
  <View className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card shadow-sm">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 6L12 2L8 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 2V15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export const FlagIcon = ({ color = '#0D1B1E', size = 20 }: { color?: string; size?: number }) => (
  <View className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card shadow-sm">
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15ZM4 15V22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export const WhatsappIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.395 0 .01 5.388 0 12.044c0 2.129.555 4.209 1.611 6.037L0 24l6.105-1.602a11.834 11.834 0 005.946 1.586h.005c6.654 0 12.04-5.388 12.044-12.045a11.817 11.817 0 00-3.486-8.412z"
      fill="#FF812D"
    />
  </Svg>
);

export const ExpertIcon = ({ size = 20, color = 'white' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsIcon = ({
  color = '#0D1B1E',
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRight = ({
  color = '#0D1B1E',
  size = 18,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5l7 7-7 7"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChasingArrowsIcon = ({
  color = '#0E5A3A',
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 1l4 4-4 4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 13v2a4 4 0 0 1-4 4H3"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RibbonIcon = ({ color = '#E85A2D', size = 48 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="6" stroke={color} strokeWidth="2.5" />
    <Path
      d="M15.24 13.5L18 22L12 18L6 22L8.76 13.5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const StarIcon = ({ color = '#0D1B1E', size = 28 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PinBadgeIcon = ({
  color = '#0D1B1E',
  size = 28,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

export const LayersIcon = ({ color = '#0D1B1E', size = 28 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 17L12 22L22 17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12L12 17L22 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ContributionsMenuIcon = ({
  color = '#0E5A3A',
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const NotificationsMenuIcon = ({
  color = '#0E5A3A',
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PrivacyMenuIcon = ({
  color = '#0E5A3A',
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" />
  </Svg>
);

export const SupportMenuIcon = ({
  color = '#0E5A3A',
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
    <Path d="M12 7v2M12 15v.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const SignOutMenuIcon = ({
  color = '#E85A2D',
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
