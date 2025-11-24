import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Header } from '../components/navigation/Header';
import { ChatMessages } from '../components/tutor/ChatMessages';
import { TutorQuickActions } from '../components/tutor/QuickActions';
import { ChatInput } from '../components/tutor/ChatInput';
import { generateTutorResponse, preloadTutorModel } from '../services/ai';

const INITIAL_MESSAGE = {
  id: '1',
  role: 'assistant',
  content: "Hi! I'm your AI tutor. I can help you with any subject - just ask me a question!",
  timestamp: Date.now(),
};

export function TutorScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = React.useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesRef = React.useRef(messages);
  const isMountedRef = React.useRef(true);

  const pushMessage = React.useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSend = React.useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) {
        return;
      }

      const timestamp = Date.now();
      const userMessage = {
        id: `${timestamp}-user`,
        role: 'user',
        content: trimmed,
        timestamp,
      };

      const conversation = [...messagesRef.current, userMessage];

      pushMessage(userMessage);
      setInputValue('');
      setIsTyping(true);

      try {
        const reply = await generateTutorResponse(conversation);
        if (!isMountedRef.current) {
          return;
        }

        pushMessage({
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Tutor response failed', error);
        if (isMountedRef.current) {
          pushMessage({
            id: `${Date.now()}-assistant-error`,
            role: 'assistant',
            content:
              "I'm having trouble thinking right now, but let's try again in a moment. You can also ask the question in a different way!",
            timestamp: Date.now(),
          });
        }
      } finally {
        if (isMountedRef.current) {
          setIsTyping(false);
        }
      }
    },
    [isTyping, pushMessage],
  );

  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  React.useEffect(() => {
    preloadTutorModel();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Ask Your Tutor" subtitle="Offline SLM - Always Available" showSettings={false} />
      <View style={{ flex: 1 }}>
        <ChatMessages messages={messages} isTyping={isTyping} />
        {messages.length === 1 ? (
          <TutorQuickActions onSelect={handleSend} />
        ) : null}
      </View>
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        isLoading={isTyping}
      />
    </View>
  );
}
