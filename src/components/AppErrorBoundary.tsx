import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Colors } from '@/tokens/design';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catches startup/render crashes so Expo Go shows an error screen instead of a blank white view.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.bg,
          paddingHorizontal: 24,
          paddingVertical: 48,
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: Colors.gold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
          ESO Energy
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 12 }}>
          App failed to start
        </Text>
        <Text style={{ color: '#A1A1AA', fontSize: 14, marginTop: 8, lineHeight: 20 }}>
          Force-close Expo Go, then scan the QR code again from the mobile folder.
        </Text>
        <ScrollView
          style={{
            marginTop: 16,
            maxHeight: 160,
            backgroundColor: '#0D1117',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Text style={{ color: '#FCA5A5', fontSize: 12, fontFamily: 'Inter_400Regular' }}>
            {this.state.error.message}
          </Text>
        </ScrollView>
        <Pressable
          onPress={this.retry}
          style={{
            marginTop: 20,
            backgroundColor: Colors.gold,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#060809', fontWeight: '600', fontSize: 15 }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
