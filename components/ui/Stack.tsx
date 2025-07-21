import React from 'react';
import { View, ViewStyle, ViewProps } from 'react-native';
import { spacing } from './MD3Theme';

export interface StackProps extends ViewProps {
  children?: React.ReactNode;
  space?: keyof typeof spacing | number;
  flex?: number;
  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  padding?: keyof typeof spacing | number;
  paddingHorizontal?: keyof typeof spacing | number;
  paddingVertical?: keyof typeof spacing | number;
  paddingTop?: keyof typeof spacing | number;
  paddingBottom?: keyof typeof spacing | number;
  paddingLeft?: keyof typeof spacing | number;
  paddingRight?: keyof typeof spacing | number;
  margin?: keyof typeof spacing | number;
  marginHorizontal?: keyof typeof spacing | number;
  marginVertical?: keyof typeof spacing | number;
  marginTop?: keyof typeof spacing | number;
  marginBottom?: keyof typeof spacing | number;
  marginLeft?: keyof typeof spacing | number;
  marginRight?: keyof typeof spacing | number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  minWidth?: ViewStyle['minWidth'];
  minHeight?: ViewStyle['minHeight'];
  maxWidth?: ViewStyle['maxWidth'];
  maxHeight?: ViewStyle['maxHeight'];
}

const getSpacingValue = (value: keyof typeof spacing | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value in spacing) return spacing[value];
  return 0;
};

const createSpacedChildren = (
  children: React.ReactNode,
  space: keyof typeof spacing | number | undefined,
  isHorizontal: boolean
) => {
  if (!space || !children) return children;
  
  const spacingValue = getSpacingValue(space);
  const childrenArray = React.Children.toArray(children);
  
  return childrenArray.map((child, index) => (
    <React.Fragment key={index}>
      {child}
      {index < childrenArray.length - 1 && (
        <View
          style={{
            [isHorizontal ? 'width' : 'height']: spacingValue,
          }}
        />
      )}
    </React.Fragment>
  ));
};

export const YStack: React.FC<StackProps> = ({
  children,
  space,
  flex,
  justifyContent,
  alignItems,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  borderTopWidth,
  borderBottomWidth,
  borderLeftWidth,
  borderRightWidth,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  style,
  ...props
}) => {
  const stackStyle: ViewStyle = {
    flexDirection: 'column',
    ...(flex !== undefined && { flex }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(padding !== undefined && { padding: getSpacingValue(padding) }),
    ...(paddingHorizontal !== undefined && { paddingHorizontal: getSpacingValue(paddingHorizontal) }),
    ...(paddingVertical !== undefined && { paddingVertical: getSpacingValue(paddingVertical) }),
    ...(paddingTop !== undefined && { paddingTop: getSpacingValue(paddingTop) }),
    ...(paddingBottom !== undefined && { paddingBottom: getSpacingValue(paddingBottom) }),
    ...(paddingLeft !== undefined && { paddingLeft: getSpacingValue(paddingLeft) }),
    ...(paddingRight !== undefined && { paddingRight: getSpacingValue(paddingRight) }),
    ...(margin !== undefined && { margin: getSpacingValue(margin) }),
    ...(marginHorizontal !== undefined && { marginHorizontal: getSpacingValue(marginHorizontal) }),
    ...(marginVertical !== undefined && { marginVertical: getSpacingValue(marginVertical) }),
    ...(marginTop !== undefined && { marginTop: getSpacingValue(marginTop) }),
    ...(marginBottom !== undefined && { marginBottom: getSpacingValue(marginBottom) }),
    ...(marginLeft !== undefined && { marginLeft: getSpacingValue(marginLeft) }),
    ...(marginRight !== undefined && { marginRight: getSpacingValue(marginRight) }),
    ...(backgroundColor && { backgroundColor }),
    ...(borderRadius !== undefined && { borderRadius }),
    ...(borderWidth !== undefined && { borderWidth }),
    ...(borderColor && { borderColor }),
    ...(borderTopWidth !== undefined && { borderTopWidth }),
    ...(borderBottomWidth !== undefined && { borderBottomWidth }),
    ...(borderLeftWidth !== undefined && { borderLeftWidth }),
    ...(borderRightWidth !== undefined && { borderRightWidth }),
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(minWidth !== undefined && { minWidth }),
    ...(minHeight !== undefined && { minHeight }),
    ...(maxWidth !== undefined && { maxWidth }),
    ...(maxHeight !== undefined && { maxHeight }),
  };

  return (
    <View style={[stackStyle, style]} {...props}>
      {createSpacedChildren(children, space, false)}
    </View>
  );
};

export const XStack: React.FC<StackProps> = ({
  children,
  space,
  flex,
  justifyContent,
  alignItems,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  borderTopWidth,
  borderBottomWidth,
  borderLeftWidth,
  borderRightWidth,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  style,
  ...props
}) => {
  const stackStyle: ViewStyle = {
    flexDirection: 'row',
    ...(flex !== undefined && { flex }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(padding !== undefined && { padding: getSpacingValue(padding) }),
    ...(paddingHorizontal !== undefined && { paddingHorizontal: getSpacingValue(paddingHorizontal) }),
    ...(paddingVertical !== undefined && { paddingVertical: getSpacingValue(paddingVertical) }),
    ...(paddingTop !== undefined && { paddingTop: getSpacingValue(paddingTop) }),
    ...(paddingBottom !== undefined && { paddingBottom: getSpacingValue(paddingBottom) }),
    ...(paddingLeft !== undefined && { paddingLeft: getSpacingValue(paddingLeft) }),
    ...(paddingRight !== undefined && { paddingRight: getSpacingValue(paddingRight) }),
    ...(margin !== undefined && { margin: getSpacingValue(margin) }),
    ...(marginHorizontal !== undefined && { marginHorizontal: getSpacingValue(marginHorizontal) }),
    ...(marginVertical !== undefined && { marginVertical: getSpacingValue(marginVertical) }),
    ...(marginTop !== undefined && { marginTop: getSpacingValue(marginTop) }),
    ...(marginBottom !== undefined && { marginBottom: getSpacingValue(marginBottom) }),
    ...(marginLeft !== undefined && { marginLeft: getSpacingValue(marginLeft) }),
    ...(marginRight !== undefined && { marginRight: getSpacingValue(marginRight) }),
    ...(backgroundColor && { backgroundColor }),
    ...(borderRadius !== undefined && { borderRadius }),
    ...(borderWidth !== undefined && { borderWidth }),
    ...(borderColor && { borderColor }),
    ...(borderTopWidth !== undefined && { borderTopWidth }),
    ...(borderBottomWidth !== undefined && { borderBottomWidth }),
    ...(borderLeftWidth !== undefined && { borderLeftWidth }),
    ...(borderRightWidth !== undefined && { borderRightWidth }),
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(minWidth !== undefined && { minWidth }),
    ...(minHeight !== undefined && { minHeight }),
    ...(maxWidth !== undefined && { maxWidth }),
    ...(maxHeight !== undefined && { maxHeight }),
  };

  return (
    <View style={[stackStyle, style]} {...props}>
      {createSpacedChildren(children, space, true)}
    </View>
  );
}; 