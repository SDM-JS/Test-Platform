'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function RoomAccess() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [existingAnswers, setExistingAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (roomId) {
      checkAuthAndRoom();
    }
  }, [roomId]);

  async function checkAuthAndRoom() {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.user && userData.user.role === 'STUDENT') {
          setUser(userData.user);
          await loadRoom();
          await joinRoomAndLoadQuestions();
          setLoading(false);
          return;
        }
      }

      await loadRoom();
      setShowLogin(true);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setShowLogin(true);
      setLoading(false);
    }
  }

  async function loadRoom() {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);

        if (data.room.status === 'CLOSED') {
          await loadResult();
        }
      }
    } catch (error) {
      console.error('Load room error:', error);
    }
  }

  async function loadResult() {
    try {
      const res = await fetch(`/api/rooms/${roomId}/results`);
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      }
    } catch (error) {
      console.error('Load result error:', error);
    }
  }

  async function handleStudentLogin(e) {
    e.preventDefault();

    if (!studentName.trim()) {
      toast.error('Лутфан номи худро ворид кунед');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: studentName, roomId })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setShowLogin(false);
        await joinRoomAndLoadQuestions();
      } else {
        toast.error('Воридшавӣ муяссар нашуд');
      }
    } catch (error) {
      toast.error('Хатогӣ рӯй дод');
    }
  }

  async function joinRoomAndLoadQuestions() {
    try {
      const joinRes = await fetch(`/api/rooms/${roomId}/join`, { method: 'POST' });

      if (!joinRes.ok) {
        const data = await joinRes.json();
        toast.error(data.error || 'Ҳамроҳшавӣ ба ҳуҷра муяссар нашуд');
        return;
      }

      const questionsRes = await fetch(`/api/rooms/${roomId}/questions`);
      if (questionsRes.ok) {
        const data = await questionsRes.json();
        setQuestions(data.questions || []);
        setExistingAnswers(data.answers || []);
        setSubmitted(!!data.roomStudent?.submittedAt);

        const answerMap = {};
        for (const ans of data.answers || []) {
          answerMap[ans.questionId] = ans.answer;
        }
        setAnswers(answerMap);
      }
    } catch (error) {
      console.error('Join room error:', error);
    }
  }

  function handleAnswerChange(questionId, answer) {
    setAnswers({ ...answers, [questionId]: answer });
  }

  async function handleSubmit() {
    if (!confirm('Шумо мутмаин ҳастед, ки ҷавобҳои худро ирсол мекунед?')) return;

    const answerArray = Object.keys(answers).map(questionId => ({
      questionId,
      answer: answers[questionId]
    }));

    try {
      const res = await fetch(`/api/rooms/${roomId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray })
      });

      if (res.ok) {
        toast.success('Ҷавобҳо бомуваффақият ирсол шуданд!');
        setSubmitted(true);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Ирсоли ҷавобҳо муяссар нашуд');
      }
    } catch (error) {
      toast.error('Хатогӣ рӯй дод');
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-lg">Боршавӣ...</div>
        </div>
    );
  }

  if (!room) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <Card>
            <CardHeader>
              <CardTitle>Ҳуҷра ёфт нашуд</CardTitle>
              <CardDescription>Ҳуҷрае, ки ҷустуҷӯ мекунед, вуҷуд надорад.</CardDescription>
            </CardHeader>
          </Card>
        </div>
    );
  }

  if (showLogin) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>Барои оғози тест номи худро ворид кунед</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <Label htmlFor="name">Номи шумо</Label>
                  <Input
                      id="name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Номи пурраи худро ворид кунед"
                      required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Оғози тест
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
    );
  }

  if (room.status === 'CLOSED') {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="container mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle>{room.name}</CardTitle>
                    <Badge variant="secondary">ПЎШИДА</Badge>
                  </div>
                  <CardDescription>Ин ҳуҷраи тест пӯшида шудааст</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {result ? (
                    <div className="space-y-4">
                      <div className="text-center py-8 space-y-4">
                        <h2 className="text-4xl font-bold">Натиҷаи шумо</h2>
                        <div className="flex justify-center gap-8 text-center">
                          <div>
                            <p className="text-3xl font-bold text-primary">{result.score}</p>
                            <p className="text-sm text-muted-foreground">Хол</p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold">{result.totalPoints}</p>
                            <p className="text-sm text-muted-foreground">Ҳамагӣ холҳо</p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-green-600">{result.percentage}%</p>
                            <p className="text-sm text-muted-foreground">Фоиз</p>
                          </div>
                        </div>
                        <Badge
                            variant={result.percentage >= 60 ? 'default' : 'destructive'}
                            className="text-lg px-4 py-2"
                        >
                          {result.percentage >= 60 ? 'Гузашт' : 'Нагузашт'}
                        </Badge>
                      </div>
                    </div>
                ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Ҳанӯз натиҷа дастрас нест. Лутфан ба муаллими худ муроҷиат кунед.
                    </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>Хуш омадед, {user?.name}</CardDescription>
                </div>
                <Badge variant="default">КУШОДА</Badge>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {questions.map((question, index) => (
                <Card key={question._id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Савол {index + 1} ({question.points} {question.points === 1 ? 'хол' : 'холҳо'})
                    </CardTitle>
                    <CardDescription>{question.text}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {question.type === 'MULTIPLE_CHOICE' && (
                        <div className="space-y-2">
                          {question.options?.map((option) => (
                              <label key={option._id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                                <input
                                    type="radio"
                                    name={`question-${question._id}`}
                                    value={option._id}
                                    checked={answers[question._id] === option._id}
                                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                    disabled={submitted}
                                />
                                <span>{option.text}</span>
                              </label>
                          ))}
                        </div>
                    )}

                    {question.type === 'MATCHING' && (
                        <div className="space-y-3">
                          {question.lefts?.map((left) => {
                            const currentMatch = answers[question._id]?.find?.(m => m.leftId === left.id);
                            return (
                                <div key={left.id} className="flex items-center gap-3">
                                  <div className="flex-1 p-3 border rounded-lg bg-muted">
                                    {left.text}
                                  </div>
                                  <span className="text-2xl">→</span>
                                  <select
                                      className="flex-1 p-3 border rounded-lg"
                                      value={currentMatch?.rightId || ''}
                                      onChange={(e) => {
                                        const newMatches = [...(answers[question._id] || [])];
                                        const existingIndex = newMatches.findIndex(m => m.leftId === left.id);
                                        if (existingIndex >= 0) {
                                          newMatches[existingIndex] = { leftId: left.id, rightId: e.target.value };
                                        } else {
                                          newMatches.push({ leftId: left.id, rightId: e.target.value });
                                        }
                                        handleAnswerChange(question._id, newMatches);
                                      }}
                                      disabled={submitted}
                                  >
                                    <option value="">-- Мутобиқотро интихоб кунед --</option>
                                    {question.rights?.map((right) => (
                                        <option key={right.id} value={right.id}>
                                          {right.text}
                                        </option>
                                    ))}
                                  </select>
                                </div>
                            );
                          })}
                        </div>
                    )}

                    {question.type === 'OPEN' && (
                        <Textarea
                            value={answers[question._id] || ''}
                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            placeholder="Ҷавоби худро дар инҷо нависед..."
                            rows={4}
                            disabled={submitted}
                        />
                    )}
                  </CardContent>
                </Card>
            ))}

            {!submitted && (
                <Card>
                  <CardContent className="pt-6">
                    <Button onClick={handleSubmit} className="w-full" size="lg">
                      Ирсоли ҷавобҳо
                    </Button>
                  </CardContent>
                </Card>
            )}

            {submitted && (
                <Card className="border-green-500">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-green-600">Ҷавобҳо ирсол шуданд!</p>
                      <p className="text-muted-foreground">
                        Ҷавобҳои шумо сабт карда шуданд. Шумо метавонед то лаҳзаи пӯшидани ҳуҷра тавассути муаллим онҳоро тағйир диҳед.
                      </p>
                      <Button onClick={handleSubmit} variant="outline" className="mt-4">
                        Тағйир додани ҷавобҳо
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>
        </div>
      </div>
  );
}