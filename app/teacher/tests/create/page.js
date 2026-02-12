'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateTest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    variants: [{
      name: 'Варианти 1',
      questions: []
    }]
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok || !(await res.json()).user) {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    }
  }

  function addVariant() {
    setTestData({
      ...testData,
      variants: [...testData.variants, { name: `Варианти ${testData.variants.length + 1}`, questions: [] }]
    });
  }

  function removeVariant(variantIndex) {
    const newVariants = testData.variants.filter((_, i) => i !== variantIndex);
    setTestData({ ...testData, variants: newVariants });
  }

  function addQuestion(variantIndex) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions.push({
      text: '',
      type: 'MULTIPLE_CHOICE',
      points: 1,
      options: [{ text: '', isCorrect: false }],
      pairs: []
    });
    setTestData({ ...testData, variants: newVariants });
  }

  function removeQuestion(variantIndex, questionIndex) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions = newVariants[variantIndex].questions.filter((_, i) => i !== questionIndex);
    setTestData({ ...testData, variants: newVariants });
  }

  function updateQuestion(variantIndex, questionIndex, field, value) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions[questionIndex][field] = value;

    if (field === 'type') {
      if (value === 'MULTIPLE_CHOICE') {
        newVariants[variantIndex].questions[questionIndex].options = [{ text: '', isCorrect: false }];
        newVariants[variantIndex].questions[questionIndex].pairs = [];
      } else if (value === 'MATCHING') {
        newVariants[variantIndex].questions[questionIndex].pairs = [{ left: '', right: '' }];
        newVariants[variantIndex].questions[questionIndex].options = [];
      } else {
        newVariants[variantIndex].questions[questionIndex].options = [];
        newVariants[variantIndex].questions[questionIndex].pairs = [];
      }
    }

    setTestData({ ...testData, variants: newVariants });
  }

  function addOption(variantIndex, questionIndex) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions[questionIndex].options.push({ text: '', isCorrect: false });
    setTestData({ ...testData, variants: newVariants });
  }

  function updateOption(variantIndex, questionIndex, optionIndex, field, value) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions[questionIndex].options[optionIndex][field] = value;
    setTestData({ ...testData, variants: newVariants });
  }

  function removeOption(variantIndex, questionIndex, optionIndex) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions[questionIndex].options =
        newVariants[variantIndex].questions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setTestData({ ...testData, variants: newVariants });
  }

  function addPair(variantIndex, questionIndex) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions[questionIndex].pairs.push({ left: '', right: '' });
    setTestData({ ...testData, variants: newVariants });
  }

  function updatePair(variantIndex, questionIndex, pairIndex, field, value) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions[questionIndex].pairs[pairIndex][field] = value;
    setTestData({ ...testData, variants: newVariants });
  }

  function removePair(variantIndex, questionIndex, pairIndex) {
    const newVariants = [...testData.variants];
    newVariants[variantIndex].questions[questionIndex].pairs =
        newVariants[variantIndex].questions[questionIndex].pairs.filter((_, i) => i !== pairIndex);
    setTestData({ ...testData, variants: newVariants });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!testData.title || testData.variants.length === 0) {
      toast.error('Лутфан номи тест ва ақаллан як вариантро илова кунед');
      return;
    }

    for (const variant of testData.variants) {
      if (variant.questions.length === 0) {
        toast.error('Ҳар як вариант бояд ақаллан як савол дошта бошад');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      if (res.ok) {
        toast.success('Тест бомуваффақият сохта шуд!');
        router.push('/teacher');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Хатогӣ ҳангоми сохтани тест');
      }
    } catch (error) {
      toast.error('Хатогӣ рӯй дод');
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/teacher')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Бозгашт
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Сохтани тести нав</CardTitle>
              <CardDescription>Тести худро бо якчанд вариант ва саволҳо созед</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Test Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Номи тест *</Label>
                    <Input
                        id="title"
                        value={testData.title}
                        onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                        placeholder="Масалан: Санҷиши риёзӣ, боби 1"
                        required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Тавсиф</Label>
                    <Textarea
                        id="description"
                        value={testData.description}
                        onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                        placeholder="Тавсифи кӯтоҳи тест"
                        rows={3}
                    />
                  </div>
                </div>

                {/* Variants */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Вариантҳо</h3>
                    <Button type="button" onClick={addVariant} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Иловаи вариант
                    </Button>
                  </div>

                  {testData.variants.map((variant, variantIndex) => (
                      <Card key={variantIndex} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <Input
                                value={variant.name}
                                onChange={(e) => {
                                  const newVariants = [...testData.variants];
                                  newVariants[variantIndex].name = e.target.value;
                                  setTestData({ ...testData, variants: newVariants });
                                }}
                                className="font-semibold max-w-xs"
                            />
                            <div className="flex gap-2">
                              <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => addQuestion(variantIndex)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Иловаи савол
                              </Button>
                              {testData.variants.length > 1 && (
                                  <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeVariant(variantIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {variant.questions.length === 0 ? (
                              <p className="text-muted-foreground text-center py-4">Ҳанӯз саволе илова нашудааст</p>
                          ) : (
                              variant.questions.map((question, questionIndex) => (
                                  <Card key={questionIndex} className="bg-accent/30">
                                    <CardContent className="pt-4 space-y-3">
                                      <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-3">
                                          <div>
                                            <Label>Савол {questionIndex + 1}</Label>
                                            <Textarea
                                                value={question.text}
                                                onChange={(e) => updateQuestion(variantIndex, questionIndex, 'text', e.target.value)}
                                                placeholder="Матни саволро ворид кунед"
                                                rows={2}
                                            />
                                          </div>

                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <Label>Навъ</Label>
                                              <select
                                                  className="w-full p-2 border rounded-md"
                                                  value={question.type}
                                                  onChange={(e) => updateQuestion(variantIndex, questionIndex, 'type', e.target.value)}
                                              >
                                                <option value="MULTIPLE_CHOICE">Интихоби сершумор</option>
                                                <option value="MATCHING">Мутобиқсозӣ</option>
                                                <option value="OPEN">Кушод</option>
                                              </select>
                                            </div>
                                            <div>
                                              <Label>Холҳо</Label>
                                              <Input
                                                  type="number"
                                                  value={question.points}
                                                  onChange={(e) => updateQuestion(variantIndex, questionIndex, 'points', parseInt(e.target.value) || 1)}
                                                  min="1"
                                              />
                                            </div>
                                          </div>

                                          {/* Multiple Choice Options */}
                                          {question.type === 'MULTIPLE_CHOICE' && (
                                              <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                  <Label>Интихобҳо</Label>
                                                  <Button
                                                      type="button"
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => addOption(variantIndex, questionIndex)}
                                                  >
                                                    <Plus className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                                {question.options.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="flex gap-2 items-center">
                                                      <Input
                                                          value={option.text}
                                                          onChange={(e) => updateOption(variantIndex, questionIndex, optionIndex, 'text', e.target.value)}
                                                          placeholder={`Интихоби ${optionIndex + 1}`}
                                                      />
                                                      <label className="flex items-center gap-2 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={option.isCorrect}
                                                            onChange={(e) => updateOption(variantIndex, questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                                        />
                                                        <span className="text-sm">Дуруст</span>
                                                      </label>
                                                      {question.options.length > 1 && (
                                                          <Button
                                                              type="button"
                                                              size="sm"
                                                              variant="ghost"
                                                              onClick={() => removeOption(variantIndex, questionIndex, optionIndex)}
                                                          >
                                                            <Trash2 className="h-3 w-3" />
                                                          </Button>
                                                      )}
                                                    </div>
                                                ))}
                                              </div>
                                          )}

                                          {/* Matching Pairs */}
                                          {question.type === 'MATCHING' && (
                                              <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                  <Label>Ҷуфтҳо</Label>
                                                  <Button
                                                      type="button"
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => addPair(variantIndex, questionIndex)}
                                                  >
                                                    <Plus className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                                {question.pairs.map((pair, pairIndex) => (
                                                    <div key={pairIndex} className="flex gap-2 items-center">
                                                      <Input
                                                          value={pair.left}
                                                          onChange={(e) => updatePair(variantIndex, questionIndex, pairIndex, 'left', e.target.value)}
                                                          placeholder="Тарафи чап"
                                                      />
                                                      <span>↔</span>
                                                      <Input
                                                          value={pair.right}
                                                          onChange={(e) => updatePair(variantIndex, questionIndex, pairIndex, 'right', e.target.value)}
                                                          placeholder="Тарафи рост"
                                                      />
                                                      {question.pairs.length > 1 && (
                                                          <Button
                                                              type="button"
                                                              size="sm"
                                                              variant="ghost"
                                                              onClick={() => removePair(variantIndex, questionIndex, pairIndex)}
                                                          >
                                                            <Trash2 className="h-3 w-3" />
                                                          </Button>
                                                      )}
                                                    </div>
                                                ))}
                                              </div>
                                          )}

                                          {question.type === 'OPEN' && (
                                              <p className="text-sm text-muted-foreground italic">Савол бо ҷавоби кушод (мати)</p>
                                          )}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeQuestion(variantIndex, questionIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                              ))
                          )}
                        </CardContent>
                      </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Сохта истодааст...' : 'Сохтани тест'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push('/teacher')}>
                    Бекор кардан
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}