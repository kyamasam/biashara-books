import { BrandColors } from '@/constants/theme';
import { Plus, X } from 'lucide-react-native';
import { MutableRefObject } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { styles } from './styles';

type Props = {
  hasMultipleLocations: boolean | null;
  locations: string[];
  locationInputRefs: MutableRefObject<(TextInput | null)[]>;
  onSetHasMultiple: (value: boolean) => void;
  onAddLocation: () => void;
  onUpdateLocation: (index: number, value: string) => void;
  onRemoveLocation: (index: number) => void;
};

export function StepLocations({
  hasMultipleLocations,
  locations,
  locationInputRefs,
  onSetHasMultiple,
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation,
}: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>Your Locations</Text>
      <Text style={styles.stepSubtitle}>Do you operate from more than one shop or branch?</Text>

      <View style={styles.toggleCards}>
        <Pressable
          style={[styles.toggleCard, hasMultipleLocations === false && styles.toggleCardSelected]}
          onPress={() => onSetHasMultiple(false)}
        >
          <Text style={[styles.toggleCardTitle, hasMultipleLocations === false && styles.toggleCardTitleSelected]}>
            Just one location
          </Text>
          <Text style={styles.toggleCardDesc}>All sales happen from one place</Text>
        </Pressable>

        <Pressable
          style={[styles.toggleCard, hasMultipleLocations === true && styles.toggleCardSelected]}
          onPress={() => onSetHasMultiple(true)}
        >
          <Text style={[styles.toggleCardTitle, hasMultipleLocations === true && styles.toggleCardTitleSelected]}>
            Multiple locations
          </Text>
          <Text style={styles.toggleCardDesc}>I have more than one shop or branch</Text>
        </Pressable>
      </View>

      {hasMultipleLocations && (
        <View style={styles.locationsSection}>
          <Text style={styles.label}>LOCATION NAMES</Text>

          {locations.map((loc, index) => (
            <View key={index} style={styles.locationRow}>
              <TextInput
                ref={(ref) => { locationInputRefs.current[index] = ref; }}
                style={styles.locationInput}
                placeholder={`e.g. ${index === 0 ? 'CBD Branch' : index === 1 ? 'Westlands Branch' : `Branch ${index + 1}`}`}
                placeholderTextColor="#B8B8B8"
                value={loc}
                onChangeText={(v) => onUpdateLocation(index, v)}
                returnKeyType="next"
                onSubmitEditing={() => locationInputRefs.current[index + 1]?.focus()}
              />
              {locations.length > 1 && (
                <Pressable style={styles.removeBtn} onPress={() => onRemoveLocation(index)}>
                  <X size={16} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable style={styles.addLocationBtn} onPress={onAddLocation}>
            <Plus size={16} color={BrandColors.primary} />
            <Text style={styles.addLocationText}>Add another location</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
