import { BrandColors, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    paddingTop: 8,
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    fontWeight: '800',
    fontSize: 15,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressSegmentActive: {
    backgroundColor: BrandColors.primary,
  },
  content: {
    flex: 1,
    paddingTop: 36,
    gap: 24,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentInner: {
    gap: 24,
    paddingTop: 36,
    paddingBottom: 24,
  },
  pinContent: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginTop: -12,
  },
  field: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  textInput: {
    fontSize: 18,
    color: '#111827',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 10,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 10,
  },
  pickerTriggerText: {
    fontSize: 18,
    color: '#111827',
  },
  pickerPlaceholder: {
    color: '#B8B8B8',
  },
  pickerChevron: {
    fontSize: 22,
    color: '#9CA3AF',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 10,
  },
  countryCode: {
    fontSize: 20,
    color: '#6B7280',
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '300',
    color: '#374151',
  },
  mpesaCards: {
    gap: 12,
  },
  mpesaCard: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  mpesaCardSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: '#F0FDF4',
  },
  mpesaCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  mpesaCardTitleSelected: {
    color: BrandColors.primary,
  },
  mpesaCardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  toggleCards: {
    gap: 12,
  },
  toggleCard: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  toggleCardSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: '#F0FDF4',
  },
  toggleCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  toggleCardTitleSelected: {
    color: BrandColors.primary,
  },
  toggleCardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  locationsSection: {
    gap: 12,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 10,
    gap: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 2,
  },
  removeBtn: {
    padding: 4,
  },
  addLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    alignSelf: 'flex-start',
  },
  addLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.primary,
  },
  footer: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  nextBtn: {
    flex: 1,
  },
  backBtn: {
    borderColor: '#C2C2C2',
    padding: 0,
  },
  skipLink: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
  skipText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  spinner: {
    marginTop: 40,
  },
  startOver: {
    marginTop: 24,
  },
  startOverText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  modalItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
  },
  modalItemTextSelected: {
    color: BrandColors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: BrandColors.primary,
    fontWeight: '700',
  },
});
