import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { HeaderBar } from '../components/HeaderBar';
import { TextInput } from '../components/TextInput';
import { Select } from '../components/Select';
import { useAuth } from '../context/AuthContext';
import { owesApi, CreateOweDto, CreateOweItemDto, CreateOweParticipantDto } from '../services/api/endpoints/owes';
import { friendsApi, Friend } from '../services/api/endpoints/friends';
import { groupsApi, Group, GroupMember } from '../services/api/endpoints/groups';
import Icon from '../components/Icon';

interface OweDetailsScreenProps {
  onBack: () => void;
  onSuccess: (oweId: number) => void;
  friendId?: number;
  groupId?: number;
}

interface ItemFormData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  oweType: 'friend' | 'group'; // АБО друг АБО група
  friendId?: number; // Для боргу до друга
  friendSum?: string; // Сума для боргу до друга
  participants: ParticipantFormData[]; // Тільки для боргу до групи
}

interface ParticipantFormData {
  id: string;
  sum: string;
  type: 'friend' | 'group';
  friendId?: number;
  groupId?: number;
  groupMembers?: { userId: number; sum: string }[];
}

export const CreateOweScreen: React.FC<OweDetailsScreenProps> = ({ onBack, onSuccess, friendId, groupId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [recipientType, setRecipientType] = useState<'friend' | 'group'>(groupId ? 'group' : (friendId ? 'friend' : 'friend'));
  const [recipientId, setRecipientId] = useState<number | undefined>(groupId ?? friendId);
  const [items, setItems] = useState<ItemFormData[]>([
    {
      id: '1',
      name: '',
      description: '',
      imageUrl: '',
      oweType: 'friend',
      friendId: friendId,
      participants: [],
    },
  ]);

  // Data for dropdowns
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<{ [groupId: number]: GroupMember[] }>({});

  useEffect(() => {
    loadFriendsAndGroups();
    // Якщо група обрана, завантажуємо її учасників
    if (recipientType === 'group' && recipientId) {
      loadGroupMembers(recipientId);
    }
  }, [recipientType, recipientId]);

  const loadFriendsAndGroups = async () => {
    try {
      const [friendsRes, groupsRes] = await Promise.all([
        friendsApi.getUserFriends(user!.id),
        groupsApi.getMyGroups(),
      ]);
      setFriends(friendsRes || []);
      setGroups(groupsRes || []);
    } catch (err) {
      console.error('Error loading friends and groups:', err);
    }
  };

  const loadGroupMembers = async (groupId: number) => {
    if (groupMembers[groupId]) return; // Already loaded
    
    try {
      const response = await groupsApi.getGroupMembers(groupId);
      setGroupMembers(prev => ({
        ...prev,
        [groupId]: response || [],
      }));
    } catch (err) {
      console.error('Error loading group members:', err);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: '',
        description: '',
        imageUrl: '',
        oweType: 'friend',
        participants: [],
      },
    ]);
  };

  const removeItem = (itemId: string) => {
    if (items.length === 1) {
      Alert.alert('Помилка', 'Має бути хоча б один пункт боргу');
      return;
    }
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof ItemFormData, value: any) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const addParticipant = (itemId: string) => {
    // Завантажуємо учасників групи, якщо вона обрана
    if (recipientType === 'group' && recipientId) {
      loadGroupMembers(recipientId);
    }
    
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          participants: [
            ...item.participants,
            {
              id: Date.now().toString(),
              sum: '',
              type: recipientType === 'group' ? 'group' : 'friend',
              friendId: undefined, // Буде обрано в Select
              groupId: recipientType === 'group' ? recipientId : undefined,
            },
          ],
        };
      }
      return item;
    }));
  };

  const removeParticipant = (itemId: string, participantId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          participants: item.participants.filter(p => p.id !== participantId),
        };
      }
      return item;
    }));
  };

  const updateParticipant = (
    itemId: string,
    participantId: string,
    field: keyof ParticipantFormData,
    value: any
  ) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          participants: item.participants.map(p => {
            if (p.id === participantId) {
              const updated = { ...p, [field]: value };
              
              // When type changes, reset related fields
              if (field === 'type') {
                if (value === 'friend') {
                  updated.groupId = undefined;
                  updated.groupMembers = undefined;
                } else {
                  updated.friendId = undefined;
                }
              }
              
              // When group changes, load members
              if (field === 'groupId' && value) {
                loadGroupMembers(value);
                updated.groupMembers = [];
              }
              
              return updated;
            }
            return p;
          }),
        };
      }
      return item;
    }));
  };

  const addGroupMemberToParticipant = (itemId: string, participantId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          participants: item.participants.map(p => {
            if (p.id === participantId) {
              return {
                ...p,
                groupMembers: [
                  ...(p.groupMembers || []),
                  { userId: 0, sum: '' },
                ],
              };
            }
            return p;
          }),
        };
      }
      return item;
    }));
  };

  const removeGroupMember = (itemId: string, participantId: string, index: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          participants: item.participants.map(p => {
            if (p.id === participantId) {
              return {
                ...p,
                groupMembers: p.groupMembers?.filter((_, i) => i !== index),
              };
            }
            return p;
          }),
        };
      }
      return item;
    }));
  };

  const updateGroupMember = (
    itemId: string,
    participantId: string,
    index: number,
    field: 'userId' | 'sum',
    value: any
  ) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          participants: item.participants.map(p => {
            if (p.id === participantId && p.groupMembers) {
              const updatedMembers = [...p.groupMembers];
              updatedMembers[index] = {
                ...updatedMembers[index],
                [field]: value,
              };
              return {
                ...p,
                groupMembers: updatedMembers,
              };
            }
            return p;
          }),
        };
      }
      return item;
    }));
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Введіть назву боргу';
    if (items.length === 0) return 'Додайте хоча б один пункт боргу';
    
    for (const item of items) {
      if (!item.name.trim()) return 'Всі пункти боргу повинні мати назву';
      // Validation differs depending on global recipient type
      if (recipientType === 'friend') {
        // require sum for each item
        if (!item.friendSum || parseFloat(item.friendSum) <= 0) return `Вкажіть суму для пункту "${item.name}"`;
        if (!recipientId) return 'Виберіть друга, якому виставляється борг';
      } else {
        // group recipient - require participants with sums
        if (item.participants.length === 0) return `Пункт "${item.name}" повинен мати хоча б одного учасника`;
        for (const participant of item.participants) {
          if (!participant.friendId) return 'Виберіть учасника групи для всіх учасників';
          if (!participant.sum || parseFloat(participant.sum) <= 0) {
            return 'Введіть коректну суму для всіх учасників';
          }
        }
      }
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Помилка валідації', error);
      return;
    }

    if (!user) {
      Alert.alert('Помилка', 'Користувач не авторизований');
      return;
    }

    try {
      setLoading(true);

      const oweItems: CreateOweItemDto[] = items.map(item => {
        const participants: CreateOweParticipantDto[] = [];
        let totalSum = 0;
        
        if (recipientType === 'friend') {
          // All items directed to the selected friend
          const sum = parseFloat(item.friendSum || '0');
          totalSum = sum;
          participants.push({
            sum,
            toUserId: recipientId,
          });
        } else {
          // Group recipient: For group debts, we only set groupId (not toUserId)
          // The database constraint requires EITHER toUserId OR groupId, not both
          item.participants.forEach(p => {
            if (p.friendId && p.sum) {
              const sum = parseFloat(p.sum);
              totalSum += sum;
              participants.push({
                sum,
                groupId: recipientId, // Only groupId for group debts
              });
            }
          });
        }

        return {
          name: item.name,
          description: item.description || undefined,
          imageUrl: item.imageUrl || undefined,
          sum: totalSum || 0,
          participants,
        };
      });

      const createDto: CreateOweDto = {
        name,
        description: description || undefined,
        image: image || undefined,
        fromUserId: user.id,
        oweItems,
      };

      const response = await owesApi.createFullOwe(createDto);
      Alert.alert('Успіх', 'Борг успішно створено', [
        { text: 'OK', onPress: () => onSuccess(response.id) }
      ]);
    } catch (err: any) {
      console.error('Error creating owe:', err);
      Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося створити борг');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderBar title="Створити борг" onBack={onBack} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>Загальна інформація</Text>
          
          <TextInput
            label="Назва боргу *"
            value={name}
            onChangeText={setName}
            placeholder="Введіть назву"
          />
          
          <TextInput
            label="Опис"
            value={description}
            onChangeText={setDescription}
            placeholder="Введіть опис (необов'язково)"
            multiline
          />
          
          <TextInput
            label="URL зображення"
            value={image}
            onChangeText={setImage}
            placeholder="https://..."
          />
        
          {/* Recipient selection block - choose friend or group for the whole owe */}
          <View style={{ marginTop: 12 }}>
            <Text style={[typography.secondary, { marginBottom: 8 }]}>Кому ви хочете виставити борг?</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title="Друг"
                variant={recipientType === 'friend' ? 'purple' : 'yellow'}
                onPress={() => {
                  setRecipientType('friend');
                  // sync items
                  setItems(curr => curr.map(it => ({ ...it, oweType: 'friend', friendId: recipientId })));
                }}
                padding={8}
              />
              <Button
                title="Група"
                variant={recipientType === 'group' ? 'purple' : 'yellow'}
                onPress={() => {
                  setRecipientType('group');
                  setItems(curr => curr.map(it => ({ ...it, oweType: 'group', friendId: undefined })));
                }}
                padding={8}
              />
            </View>

            {recipientType === 'friend' ? (
              <View style={{ marginTop: 12 }}>
                <Text style={typography.secondary}>Обрати друга (за замовчуванням)</Text>
                <Select
                  items={friends.map(f => ({ label: `@${f.username}`, value: f.id.toString() }))}
                  selectedValue={recipientId ? recipientId.toString() : ''}
                  onValueChange={(v) => {
                    const id = parseInt(v);
                    setRecipientId(id);
                    setItems(curr => curr.map(it => ({ ...it, friendId: id })));
                  }}
                />
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <Text style={typography.secondary}>Обрати групу (за замовчуванням)</Text>
                <Select
                  items={groups.map(g => ({ label: `${g.name} (${g.tag})`, value: g.id.toString() }))}
                  selectedValue={recipientId ? recipientId.toString() : ''}
                  onValueChange={(v) => {
                    const id = parseInt(v);
                    setRecipientId(id);
                    // pre-load group members
                    loadGroupMembers(id);
                  }}
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h3, styles.sectionTitle]}>Пункти боргу</Text>
            <Button
              title="Додати пункт"
              icon="homeIcon"
              onPress={addItem}
              variant="green"
              padding={8}
            />
          </View>

          {items.map((item, itemIndex) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={[typography.main, styles.itemNumber]}>
                  Пункт {itemIndex + 1}
                </Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Text style={[typography.CTA, { color: colors.coral }]}>Видалити</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                label="Назва пункту *"
                value={item.name}
                onChangeText={(value) => updateItem(item.id, 'name', value)}
                placeholder="Введіть назву"
              />

              <TextInput
                label="Опис"
                value={item.description}
                onChangeText={(value) => updateItem(item.id, 'description', value)}
                placeholder="Опис (необов'язково)"
              />

              {/* Helper text depending on recipient type */}
              {recipientType === 'group' && (
                <Text style={[typography.secondary, styles.helperText]}>
                  💡 Для групового боргу додайте кожного учасника групи окремо та вкажіть його суму
                </Text>
              )}

              {/* Для боргу до друга */}
              {recipientType === 'friend' ? (
                <>
                  {/* Друг вже обраний в основному блоці, тому просто вводимо суму */}
                  <TextInput
                    label="Сума *"
                    value={item.friendSum || ''}
                    onChangeText={(value) => updateItem(item.id, 'friendSum', value)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </>
              ) : (
                /* Для боргу до групи - показуємо учасників обраної групи */
                <View style={styles.participantsSection}>
                  <View style={styles.participantsHeader}>
                    <Text style={[typography.main, styles.participantsTitle]}>
                      Учасники групи
                    </Text>
                    <Button
                      title="Додати учасника"
                      onPress={() => addParticipant(item.id)}
                      variant="purple"
                      padding={6}
                    />
                  </View>

                  {/* Група вже обрана в основному блоці, відразу показуємо учасників */}
                  {recipientId && groupMembers[recipientId] && (
                    <View>
                      {item.participants.map((participant, pIndex) => (
                        <View key={participant.id} style={styles.participantCard}>
                          <View style={styles.participantHeader}>
                            <Text style={[typography.secondary, styles.participantNumber]}>
                              Учасник {pIndex + 1}
                            </Text>
                            <TouchableOpacity 
                              onPress={() => removeParticipant(item.id, participant.id)}
                            >
                              <Text style={[typography.CTA, { color: colors.coral }]}>
                                Видалити
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <Select
                            label="Учасник групи *"
                            items={groupMembers[recipientId]
                              .filter(gm => gm.user.id !== user?.id)
                              .map(gm => ({
                                label: `@${gm.user.username}`,
                                value: gm.user.id.toString(),
                              }))}
                            selectedValue={participant.friendId?.toString() || ''}
                            onValueChange={(value: string) =>
                              updateParticipant(item.id, participant.id, 'friendId', parseInt(value))
                            }
                          />

                          <TextInput
                            label="Сума *"
                            value={participant.sum || ''}
                            onChangeText={(value) =>
                              updateParticipant(item.id, participant.id, 'sum', value)
                            }
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        <Button
          title={loading ? 'Створення...' : 'Створити борг'}
          onPress={handleSubmit}
          variant="purple"
          padding={16}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border_divider,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    color: colors.text,
    fontWeight: '600',
  },
  participantsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantsTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  participantCard: {
    backgroundColor: colors.primary15,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantNumber: {
    color: colors.text,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
  },
  groupMembersSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },
  groupMembersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupMembersTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  groupMemberCard: {
    backgroundColor: colors.green15,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.green,
  },
  groupMemberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  sumInputWrapper: {
    flex: 1,
  },
  removeMemberButton: {
    padding: 8,
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: 16,
  },
  helperText: {
    color: colors.text,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default CreateOweScreen;
