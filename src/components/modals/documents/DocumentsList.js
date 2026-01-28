import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import  AppText  from '../../AppText';
import EyeOpen from '../../icons/EyeOpen';
import { colors } from '../../../styles/colors';

const DocumentsList = ({
    customerDocuments = {},
    onPreview,
}) => {
    const documents = customerDocuments?.allDocuments || [];

    if (!documents.length) {
        return (
            <View style={styles.emptyContainer}>
                <Icon
                    name="document-outline"
                    size={42}
                    color="#D1D5DB"
                />
                <AppText style={styles.emptyText}>
                    No documents available
                </AppText>
            </View>
        );
    }

    return (
        <View style={styles.list}>
            {documents.map((doc, index) => (
                <View key={index} style={styles.item}>
                    {/* Left */}
                    <View style={styles.left}>
                        <Icon
                            name="document-text-outline"
                            size={18}
                            color="#6B7280"
                        />
                        <AppText
                            numberOfLines={1}
                            style={styles.label}
                        >
                            {doc.doctypeName}
                        </AppText>
                    </View>

                    {/* Preview */}
                    <TouchableOpacity
                        onPress={() => onPreview(doc)}
                        activeOpacity={0.7}
                    >
                        <EyeOpen
                            width={18}
                            height={18}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};

export default DocumentsList;
const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F1F1F1',
        marginBottom: 10,
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },

    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        flexShrink: 1,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },

    emptyText: {
        marginTop: 10,
        fontSize: 14,
        color: '#9CA3AF',
    },
});
