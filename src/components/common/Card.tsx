import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
});
