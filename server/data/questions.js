module.exports = {
	questions: [
		{
			id: 24,
			statement: 'अपना विकल्प चुनें',
			type: 'button',
			answers: [
				{
					nextQuestion: 22,
					value: 0,
					statement: 'पिछला परामर्श'
				},
				{
					nextQuestion: 25,
					value: 1,
					statement: 'नया परामर्श'
				}
			]
		},
		{
			id: 22,
			statement: 'आपका शुभ नाम?',
			type: 'text',
			nextQuestion: 23
		},
		{
			id: 23,
			statement: 'आपका संपर्क नंबर?',
			type: 'tel',
			nextQuestion: 0,
			pattern: '[0-9]{10}'
		},
		{
			id: 21,
			statement: 'आपका शुभ नाम?',
			type: 'text',
			nextQuestion: 1
		},
		{
			id: 1,
			statement: 'आपका लिंग क्या है?',
			type: 'button',
			answers: [
				{
					nextQuestion: 2,
					value: 0,
					statement: 'पुरुष',
					dbValue: 'Male'
				},
				{
					nextQuestion: 2,
					value: 1,
					statement: 'महिला',
					dbValue: 'Female'
				},
				{
					nextQuestion: 2,
					value: 2,
					statement: 'अन्य',
					dbValue: 'Others'
				}
			]
		},
		{
			id: 2,
			statement: 'आपकी उम्र?',
			type: 'tel',
			nextQuestion: 3,
			pattern: '[0-9]{1,3}'
		},
		{
			id: 3,
			statement: 'आपका संपर्क नंबर?',
			type: 'tel',
			nextQuestion: 29,
			pattern: '[0-9]{10}'
		},
		{
			id: 29,
			statement: 'क्या आप सूचनाओं के लिए ईमेल आई.डी. प्रदान करना चाहते हैं?',
			type: 'button',
			answers: [
				{
					nextQuestion: 30,
					value: 0,
					statement: 'हाँ'
				},
				{
					nextQuestion: 4,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 30,
			statement: 'आपकी ईमेल आई.डी.?',
			type: 'text',
			nextQuestion: 4
		},
		{
			id: 25,
			statement: 'अस्पताल चुनकर चेकअप शुरू करे',
			type: 'select',
			answers: [
				{
					nextQuestion: 28,
					value: 0,
					statement: 'AIIMS Jodhpur',
					dbValue: 'AIIMS Jodhpur'
				}
			]
		},
		{
			id: 28,
			statement: 'एम्स मरीज की आई.डी.',
			type: 'text',
			nextQuestion: 21
		},
		{
			id: 4,
			statement: 'अपना विकल्प चुनें',
			type: 'button',
			answers: [
				{
					nextQuestion: 19,
					value: 0,
					statement: 'O.P.D / सामान्य परामर्श',
					dbValue: 'OPD'
				},
				{
					nextQuestion: 5,
					value: 1,
					statement: 'COVID-19 हेतु परामर्श',
					dbValue: 'COVID-19'
				}
			]
		},
		{
			id: 5,
			statement: 'क्या आपको बुखार है?',
			type: 'button',
			answers: [
				{
					nextQuestion: 6,
					value: 0,
					statement: 'हाँ'
				},
				{
					nextQuestion: 7,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 6,
			statement: 'वर्तमान में आपके शरीर का ताप क्या है?',
			type: 'select',
			answers: [
				{
					nextQuestion: 7,
					value: 0,
					statement: 'मापा नहीं ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 7,
					value: 1,
					statement: '100°',
					dbValue: '100°'
				},
				{
					nextQuestion: 7,
					value: 2,
					statement: '101°',
					dbValue: '101°'
				},
				{
					nextQuestion: 7,
					value: 3,
					statement: '102°',
					dbValue: '102°'
				},
				{
					nextQuestion: 7,
					value: 4,
					statement: '103°',
					dbValue: '103°'
				}
			]
		},
		{
			id: 7,
			statement: 'क्या आपको खासी है?',
			type: 'button',
			answers: [
				{
					nextQuestion: 8,
					value: 0,
					statement: 'हाँ'
				},
				{
					nextQuestion: 9,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 8,
			statement: 'क्या आपको खांसते वक्त बलगम की भी शिकायत है?',
			type: 'button',
			answers: [
				{
					nextQuestion: 9,
					value: 0,
					statement: 'हाँ',
					dbValue: 'Sputum'
				},
				{
					nextQuestion: 9,
					value: 1,
					statement: 'नहीं, सिर्फ सूखी खांसी',
					dbValue: 'Dry'
				}
			]
		},
		{
			id: 9,
			statement: 'सांस लेने में कोई तकलीफ?',
			type: 'button',
			answers: [
				{
					nextQuestion: 10,
					value: 0,
					statement: 'जी हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 10,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 10,
			statement: 'क्या आपको शरीर में थकान या दर्द की भी शिकायत है?',
			type: 'button',
			answers: [
				{
					nextQuestion: 11,
					value: 0,
					statement: 'जी हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 11,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 11,
			statement: 'सिर दर्द की तकलीफ?',
			type: 'button',
			answers: [
				{
					nextQuestion: 12,
					value: 0,
					statement: 'हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 12,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 12,
			statement: 'गले में खराश?',
			type: 'button',
			answers: [
				{
					nextQuestion: 26,
					value: 0,
					statement: 'हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 26,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 13,
			statement: 'क्या आपने पिछले 14 दिनों में कोई अंतरराष्ट्रीय यात्रा की है?',
			type: 'button',
			answers: [
				{
					nextQuestion: 14,
					value: 0,
					statement: 'हाँ'
				},
				{
					nextQuestion: 15,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 14,
			statement: 'कितने दिन पहले?',
			type: 'select',
			answers: [
				{
					nextQuestion: 15,
					value: 0,
					statement: 'आज',
					dbValue: 'today'
				},
				{
					nextQuestion: 15,
					value: 1,
					statement: 'कल',
					dbValue: 'yesterday'
				},
				{
					nextQuestion: 15,
					value: 2,
					statement: 'परसों',
					dbValue: '2 days'
				},
				{
					nextQuestion: 15,
					value: 3,
					statement: '3 दिन पहले',
					dbValue: '3 days'
				},
				{
					nextQuestion: 15,
					value: 4,
					statement: '4 दिन पहले',
					dbValue: '4 days'
				},
				{
					nextQuestion: 15,
					value: 5,
					statement: '5 दिन पहले',
					dbValue: '5 days'
				},
				{
					nextQuestion: 15,
					value: 6,
					statement: '6 दिन पहले',
					dbValue: '6 days'
				},
				{
					nextQuestion: 15,
					value: 7,
					statement: '7 दिन पहले',
					dbValue: '7 days'
				},
				{
					nextQuestion: 15,
					value: 8,
					statement: '8 दिन पहले',
					dbValue: '8 days'
				},
				{
					nextQuestion: 15,
					value: 9,
					statement: '9 दिन पहले',
					dbValue: '9 days'
				},
				{
					nextQuestion: 15,
					value: 10,
					statement: '10 दिन पहले',
					dbValue: '10 days'
				},
				{
					nextQuestion: 15,
					value: 11,
					statement: '11 दिन पहले',
					dbValue: '11 days'
				},
				{
					nextQuestion: 15,
					value: 12,
					statement: '12 दिन पहले',
					dbValue: '12 days'
				},
				{
					nextQuestion: 15,
					value: 13,
					statement: '13 दिन पहले',
					dbValue: '13 days'
				},
				{
					nextQuestion: 15,
					value: 14,
					statement: '14 दिन पहले',
					dbValue: '14 days'
				}
			]
		},
		{
			id: 15,
			statement: 'क्या आपके घर में कोई इस नए कोरोना वायरस से संक्रमित है?',
			type: 'button',
			answers: [
				{
					nextQuestion: 16,
					value: 0,
					statement: 'हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 16,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 16,
			statement:
				'क्या आप पिछले 14 दिनों में COVID-19 के सकारात्मक पाए गए किसी व्यक्ति के निकट संपर्क में थे?',
			type: 'button',
			answers: [
				{
					nextQuestion: 17,
					value: 0,
					statement: 'हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 17,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 17,
			statement: 'क्या आप उपरोक्त लक्षणों के अलावा भी किसी अन्य लक्षण का सामना कर रहे हैं?',
			type: 'text',
			nextQuestion: 0
		},
		{
			id: 19,
			statement: 'आप अपनी तकलीफ / दिख रहे लक्षण बताये?',
			type: 'text',
			nextQuestion: 20
		},
		{
			id: 20,
			statement: 'आपको कितने दिनों से ये तकलीफ है?',
			type: 'text',
			nextQuestion: 0
		},
		{
			id: 26,
			statement: 'क्या आपके खाने के स्वाद में कोई बदलाव आया है?',
			type: 'button',
			answers: [
				{
					nextQuestion: 27,
					value: 0,
					statement: 'हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 27,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 27,
			statement: 'क्या आपने अपनी नाक की क्षमता में कोई बदलाव महसूस किया है',
			type: 'button',
			answers: [
				{
					nextQuestion: 13,
					value: 0,
					statement: 'हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 13,
					value: 1,
					statement: 'नहीं'
				}
			]
		},
		{
			id: 18,
			statement: 'क्या आप डॉक्टर के परामर्श के लिए तैयार हैं?',
			type: 'button',
			answers: [
				{
					nextQuestion: 0,
					value: 0,
					statement: 'हाँ',
					dbValue: 'Yes'
				},
				{
					nextQuestion: 0,
					value: 1,
					statement: 'नहीं'
				}
			]
		}
	]
};
