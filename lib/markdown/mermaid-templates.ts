// lib/markdown/mermaid-templates.ts

export interface MermaidTemplate {
  key: string;
  labelHe: string;
  labelEn: string;
  code: string;
}

export const MERMAID_TEMPLATES: MermaidTemplate[] = [
  {
    key: 'flowchart',
    labelHe: 'תרשים זרימה',
    labelEn: 'Flowchart',
    code: `flowchart LR
    A[התחלה] --> B{תנאי?}
    B -->|כן| C[פעולה א]
    B -->|לא| D[פעולה ב]
    C --> E[סיום]
    D --> E`,
  },
  {
    key: 'sequence',
    labelHe: 'תרשים רצף',
    labelEn: 'Sequence',
    code: `sequenceDiagram
    participant א as משתמש
    participant ב as מערכת
    א->>ב: בקשה
    ב-->>א: תגובה`,
  },
  {
    key: 'class',
    labelHe: 'תרשים מחלקות',
    labelEn: 'Class',
    code: `classDiagram
    class Animal {
        +String name
        +makeSound() void
    }
    class Dog {
        +fetch() void
    }
    Animal <|-- Dog`,
  },
  {
    key: 'state',
    labelHe: 'תרשים מצבים',
    labelEn: 'State',
    code: `stateDiagram-v2
    [*] --> ממתין
    ממתין --> פועל : התחל
    פועל --> הושלם : סיים
    פועל --> ממתין : עצור
    הושלם --> [*]`,
  },
  {
    key: 'er',
    labelHe: 'תרשים ישויות',
    labelEn: 'ER Diagram',
    code: `erDiagram
    USER ||--o{ ORDER : "מבצע"
    ORDER ||--|{ ITEM : "מכיל"
    USER {
        string id PK
        string name
    }`,
  },
  {
    key: 'gantt',
    labelHe: 'תרשים גאנט',
    labelEn: 'Gantt',
    code: `gantt
    title תכנון פרויקט
    dateFormat YYYY-MM-DD
    section שלב א
    משימה ראשונה   :a1, 2024-01-01, 7d
    משימה שנייה    :a2, after a1, 5d
    section שלב ב
    משימה שלישית  :b1, after a2, 3d`,
  },
  {
    key: 'pie',
    labelHe: 'תרשים עוגה',
    labelEn: 'Pie Chart',
    code: `pie title חלוקת משאבים
    "פיתוח" : 45
    "בדיקות" : 25
    "תכנון" : 20
    "תיעוד" : 10`,
  },
];

export function getMermaidTemplate(key: string): string {
  const template = MERMAID_TEMPLATES.find((t) => t.key === key);
  if (!template) return '';
  return `\`\`\`mermaid\n${template.code}\n\`\`\`\n`;
}
