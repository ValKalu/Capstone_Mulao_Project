import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Colors from '../constants/Colors'; 


const DetailedMasteryBar = ({ skill, percentage, color, icon }) => (
    <View style={[detailedStyles.item, detailedStyles.glowCard]}>
        <View style={detailedStyles.iconContainer}>
            <Feather name={icon} size={20} color={color} />
        </View>
        <View style={detailedStyles.details}>
            <Text style={detailedStyles.skillText}>{skill}</Text>
            <Text style={detailedStyles.description}>
                You have mastered {percentage}% of concepts in this area.
            </Text>
            <View style={detailedStyles.barWrapper}>
                <View
                    style={[
                        detailedStyles.barFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: color || Colors.accent,
                        },
                    ]}
                />
            </View>
        </View>
        <Text style={detailedStyles.percentageText}>{percentage}%</Text>
    </View>
);

export default function MasteryScreen({ navigation }) {
    
    const route = useRoute();
    const { masteryData = [] } = route.params || {};

    
    const getSkillStyle = (skill) => {
        switch (skill.toLowerCase()) {
            case 'general':
                return { icon: 'star', color: Colors.accent };
            case 'math':
                return { icon: 'aperture', color: '#6be8b3' };
            case 'science':
                return { icon: 'cpu', color: '#7a81ff' };
            
            default:
                return { icon: 'book', color: Colors.textSecondary };
        }
    };

    return (
        <View style={detailedStyles.fullScreenContainer}>
            {/* Header with Back Button */}
            <View style={detailedStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={detailedStyles.headerTitle}>Detailed Mastery</Text>
            </View>

            <ScrollView contentContainerStyle={detailedStyles.scrollContent}>
                <Text style={detailedStyles.subtitle}>
                    Overview of your knowledge across all learned modules.
                </Text>

                {masteryData.length === 0 ? (
                    <Text style={detailedStyles.emptyState}>
                        Start completing quizzes to see your mastery progress here!
                    </Text>
                ) : (
                    masteryData.map((m, index) => {
                        const { icon, color } = getSkillStyle(m.skill);
                        return (
                            <DetailedMasteryBar
                                key={index}
                                skill={m.skill}
                                percentage={m.percentage}
                                color={color}
                                icon={icon}
                            />
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}


const detailedStyles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingTop: 50, 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
        marginLeft: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    subtitle: {
        color: Colors.white,
        opacity: 0.8,
        fontSize: 16,
        marginBottom: 25,
    },
    emptyState: {
        color: Colors.white,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    
    // Detailed Mastery Card Styles
    glowCard: {
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        marginBottom: 15,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    iconContainer: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    details: {
        flex: 1,
    },
    skillText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 5,
    },
    description: {
        color: Colors.white,
        opacity: 0.7,
        fontSize: 12,
        marginBottom: 8,
    },
    percentageText: {
        color: Colors.accent,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    barWrapper: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
    },
});