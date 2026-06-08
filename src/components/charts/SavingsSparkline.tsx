import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { colors } from '@/theme/tokens';

const DATA = [380, 395, 410, 388, 420, 405, 413];
const W = 200;
const H = 48;

export function SavingsSparkline() {
  const max = Math.max(...DATA);
  const min = Math.min(...DATA);
  const range = max - min || 1;
  const pts = DATA.map((y, i) => {
    const x = (i / (DATA.length - 1)) * W;
    const py = H - ((y - min) / range) * (H - 8) - 4;
    return `${x},${py}`;
  }).join(' ');

  return (
    <View style={{ height: H, marginTop: 8 }}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Polyline
          points={pts}
          fill="none"
          stroke={colors.solarDot}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
