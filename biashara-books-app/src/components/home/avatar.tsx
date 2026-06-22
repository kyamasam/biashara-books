import { StyleSheet, View } from 'react-native';

type AvatarProps = {
  size?: number;
};

export function Avatar({ size = 34 }: AvatarProps) {
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />;
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#d9d9d9',
  },
});
