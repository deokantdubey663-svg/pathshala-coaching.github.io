"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronDown, ChevronUp, FileText, GraduationCap } from "lucide-react"

type ClassKey = "8" | "9" | "10" | "11" | "12"

const syllabusData: Record<ClassKey, {
  board: string
  subjects: {
    name: string
    totalMarks: number
    chapters: { name: string; marks: number }[]
  }[]
}> = {
  "8": {
    board: "WBBSE",
    subjects: [
      {
        name: "History (इतिहास)",
        totalMarks: 90,
        chapters: [
          { name: "क्षेत्रीय शक्तियों का उदय (18वीं सदी का भारत)", marks: 10 },
          { name: "औपनिवेशिक प्रभुत्व की स्थापना (दीवानी अधिकार, बक्सर युद्ध)", marks: 10 },
          { name: "औपनिवेशिक प्रशासनिक व्यवस्था (न्याय, सेना, पुलिस, शिक्षा)", marks: 12 },
          { name: "औपनिवेशिक अर्थव्यवस्था का प्रभाव (भू-राजस्व, ग्रामीण अर्थव्यवस्था)", marks: 12 },
          { name: "औपनिवेशिक शासन के प्रति प्रतिक्रिया (1857 का विद्रोह)", marks: 14 },
          { name: "राष्ट्रीय चेतना का विकास (नरम दल और गरम दल)", marks: 12 },
          { name: "साम्प्रदायिकता से विभाजन तक और भारतीय संविधान", marks: 12 },
          { name: "नागरिक शास्त्र (भारतीय विधायिका, कार्यपालिका, न्यायपालिका)", marks: 8 },
        ],
      },
      {
        name: "Geography (भूगोल)",
        totalMarks: 90,
        chapters: [
          { name: "प्राकृतिक भूगोल: पृथ्वी की आंतरिक संरचना, चट्टानें और भू-आकृतियाँ", marks: 18 },
          { name: "मौसम और जलवायु: वायुदाब पेटियाँ, पवन प्रणालियाँ, चक्रवात", marks: 18 },
          { name: "पर्यावरण भूगोल: दबाव और असंतुलन, वैश्विक पारिस्थितिकी मुद्दे", marks: 10 },
          { name: "क्षेत्रीय भूगोल: उत्तरी अमेरिका (भौतिक, नदियाँ, प्रेयरी)", marks: 14 },
          { name: "क्षेत्रीय भूगोल: दक्षिण अमेरिका (भौतिक, अमेज़न बेसिन)", marks: 12 },
          { name: "क्षेत्रीय भूगोल: ओशिनिया (ऑस्ट्रेलिया और न्यूजीलैंड)", marks: 10 },
          { name: "मानचित्र कार्य और व्यावहारिक भूगोल अभ्यास", marks: 8 },
        ],
      },
      {
        name: "Hindi (हिंदी)",
        totalMarks: 90,
        chapters: [
          { name: "निर्धारित गद्य (कहानियाँ, संस्मरण और निबंध)", marks: 20 },
          { name: "निर्धारित पद्य (कविताएँ और दोहे व्याख्या)", marks: 20 },
          { name: "सहायक वाचन (पूरक पुस्तक - एकांकी/संक्षिप्त कथा)", marks: 10 },
          { name: "व्याकरण (संधि, लिंग, वचन, कारक, मुहावरे और लोकोक्तियाँ)", marks: 20 },
          { name: "रचनात्मक लेखन (अपठित गद्यांश, पत्र लेखन, निबंध लेखन)", marks: 20 },
        ],
      },
      {
        name: "English (अंग्रेजी)",
        totalMarks: 90,
        chapters: [
          { name: "Reading Comprehension (Seen - Prescribed Prose & Poetry)", marks: 20 },
          { name: "Reading Comprehension (Unseen Passage)", marks: 20 },
          { name: "Grammar (Tenses, Voice, Narration, Clauses, Prepositions)", marks: 25 },
          { name: "Writing Skills (Notice Writing, Letter, Paragraph, Story)", marks: 25 },
        ],
      },
    ],
  },
  "9": {
    board: "WBBSE",
    subjects: [
      {
        name: "History (इतिहास)",
        totalMarks: 90,
        chapters: [
          { name: "फ्रांसीसी क्रांति के कुछ पहलू (कारण, परिणाम, दार्शनिकों की भूमिका)", marks: 12 },
          { name: "क्रांतिकारी आदर्श, नेपोलियन साम्राज्य और राष्ट्रवाद का विचार", marks: 14 },
          { name: "19वीं सदी का यूरोप: राजतंत्रीय और राष्ट्रवादी विचारों का संघर्ष", marks: 14 },
          { name: "औद्योगिक क्रांति, उपनिवेशवाद और साम्राज्यवाद", marks: 14 },
          { name: "20वीं सदी में यूरोप (प्रथम विश्व युद्ध, रूसी क्रांति, फासीवाद)", marks: 14 },
          { name: "द्वितीय विश्व युद्ध और उसके बाद (वैश्विक व्यवस्था में बदलाव)", marks: 14 },
          { name: "राष्ट्र संघ और संयुक्त राष्ट्र संघ (UN) की स्थापना और संरचना", marks: 8 },
        ],
      },
      {
        name: "Geography (भूगोल)",
        totalMarks: 90,
        chapters: [
          { name: "प्राकृतिक भूगोल: एक ग्रह के रूप में पृथ्वी और पृथ्वी की गतियाँ", marks: 15 },
          { name: "पृथ्वी की सतह पर किसी स्थान का निर्धारण और स्थिति ज्ञात करना", marks: 10 },
          { name: "भू-आकृतिक प्रक्रियाएं, पृथ्वी के प्रमुख भू-रूप और अपक्षय", marks: 15 },
          { name: "आपदा और प्रबंधन (प्राकृतिक और मानव निर्मित)", marks: 10 },
          { name: "भारत के संसाधन (खनिज, ऊर्जा और उनका संरक्षण)", marks: 15 },
          { name: "पश्चिम बंगाल का क्षेत्रीय भूगोल (भौतिक पर्यावरण, उद्योग)", marks: 15 },
          { name: "मानचित्र और पैमाना तथा पश्चिम बंगाल का मानचित्र कार्य", marks: 10 },
        ],
      },
      {
        name: "Hindi (हिंदी)",
        totalMarks: 90,
        chapters: [
          { name: "गद्य अनुभाग (निर्धारित विस्तृत पाठ और समीक्षात्मक प्रश्न)", marks: 15 },
          { name: "पद्य अनुभाग (मध्यकालीन और आधुनिक कविताएँ, संदर्भ व्याख्या)", marks: 15 },
          { name: "सहायक पाठ (द्रुत वाचन उपन्यास / लंबी कहानी)", marks: 10 },
          { name: "व्याकरण (समानार्थी/विलोम, वाक्य भेद, वाच्य, समास, मुहावरे)", marks: 20 },
          { name: "रचनात्मक विधाएं (निबंध, प्रतिवेदन/रिपोर्ट, संवाद लेखन, भाव-पल्लवन)", marks: 30 },
        ],
      },
      {
        name: "English (अंग्रेजी)",
        totalMarks: 90,
        chapters: [
          { name: "Reading Comprehension (Seen passages from Prose & Poetry)", marks: 20 },
          { name: "Reading Comprehension (Unseen passages for analytical skills)", marks: 20 },
          { name: "Grammar and Vocabulary (Applied and functional grammar)", marks: 20 },
          { name: "Writing Skills (Editorial Letter, Official Letter, Paragraph, Report)", marks: 30 },
        ],
      },
    ],
  },
  "10": {
    board: "WBBSE (Madhyamik)",
    subjects: [
      {
        name: "History (इतिहास)",
        totalMarks: 90,
        chapters: [
          { name: "इतिहास की अवधारणा (नया सामाजिक इतिहास, खेल, भोजन, कला)", marks: 4 },
          { name: "सुधार: विशेषताएँ और अवलोकन (19वीं सदी का बंगाल, ब्रह्म समाज)", marks: 10 },
          { name: "प्रतिरोध और विद्रोह (संथाल, नील और मुंडा विद्रोह)", marks: 10 },
          { name: "सामूहिक कार्रवाई के प्रारंभिक चरण (1857 का विद्रोह, राजनीतिक संघ)", marks: 12 },
          { name: "वैकल्पिक विचार और पहल (शांतिनिकेतन, तकनीकी शिक्षा)", marks: 12 },
          { name: "किसान, श्रमिक और वामपंथी आंदोलन (20वीं सदी का भारत)", marks: 12 },
          { name: "महिलाओं, छात्रों और सीमांत वर्गों के आंदोलन", marks: 12 },
          { name: "उत्तर-औपनिवेशिक भारत (रियासतों का विलय, शरणार्थी समस्या)", marks: 8 },
        ],
      },
      {
        name: "Geography (भूगोल)",
        totalMarks: 90,
        chapters: [
          { name: "प्राकृतिक भूगोल (नदी, वायु, हिमनद के कार्य, वायुमंडल, जलमंडल)", marks: 32 },
          { name: "पर्यावरण के मुद्दे (अपशिष्ट प्रबंधन)", marks: 4 },
          { name: "भारत का भूगोल (प्राकृतिक और आर्थिक वातावरण)", marks: 32 },
          { name: "उपग्रह चित्र और स्थलाकृतिक मानचित्र", marks: 12 },
          { name: "मानचित्र कार्य (Map Work - India)", marks: 10 },
        ],
      },
      {
        name: "Hindi (हिंदी)",
        totalMarks: 90,
        chapters: [
          { name: "गद्य (कहानियां और निबंध)", marks: 15 },
          { name: "पद्य (कविताएँ)", marks: 15 },
          { name: "नाटक / सहायक पाठ (Supplementary)", marks: 10 },
          { name: "व्याकरण (समास, वाच्य, वाक्य संशोधन आदि)", marks: 20 },
          { name: "रचनात्मक लेखन (निबंध, पत्र, प्रतिवेदन, संवाद)", marks: 30 },
        ],
      },
      {
        name: "English (अंग्रेजी)",
        totalMarks: 90,
        chapters: [
          { name: "Reading Comprehension (Seen - Textbooks)", marks: 20 },
          { name: "Reading Comprehension (Unseen)", marks: 20 },
          { name: "Grammar and Vocabulary", marks: 20 },
          { name: "Writing Skill (Letter, Paragraph, Report, etc.)", marks: 30 },
        ],
      },
    ],
  },
  "11": {
    board: "WBCHSE (Higher Secondary)",
    subjects: [
      {
        name: "Political Science (राजनीति विज्ञान)",
        totalMarks: 80,
        chapters: [
          { name: "राजनीति विज्ञान: प्रकृति, क्षेत्र, राज्य की परिभाषा और विशेषताएं (Sem I - MCQ)", marks: 20 },
          { name: "नागरिकता की अवधारणा और भारतीय संविधान का निर्माण व दर्शन (Sem I - MCQ)", marks: 20 },
          { name: "भारतीय संविधान की मुख्य विशेषताएं, मौलिक अधिकार और कर्तव्य (Sem II)", marks: 20 },
          { name: "सरकार के अंग (कार्यपालिका, विधायिका, न्यायपालिका) और स्थानीय स्वशासन (Sem II)", marks: 20 },
        ],
      },
      {
        name: "Education (शिक्षा शास्त्र)",
        totalMarks: 80,
        chapters: [
          { name: "शिक्षा का अर्थ, प्रकृति, रूप और उद्देश्य (Sem I - MCQ)", marks: 20 },
          { name: "बालक का विकास और शैक्षिक मनोविज्ञान के मूल सिद्धांत (Sem I - MCQ)", marks: 20 },
          { name: "भारतीय शिक्षा का इतिहास (प्राचीन, मध्यकालीन और ब्रिटिश काल) (Sem II)", marks: 20 },
          { name: "पाश्चात्य और भारतीय दार्शनिकों के शैक्षिक विचार (गाँधी, रवींद्रनाथ, विवेकानंद) (Sem II)", marks: 20 },
        ],
      },
      {
        name: "Geography (भूगोल)",
        totalMarks: 70,
        chapters: [
          { name: "भौतिक भूगोल के सिद्धांत: पृथ्वी की उत्पत्ति, भू-आकृतियाँ (Sem I - MCQ)", marks: 18 },
          { name: "वायुमंडल और जलमंडल (महासागरीय धाराएं, ज्वार-भाटा) (Sem I - MCQ)", marks: 17 },
          { name: "जीवमंडल (पारिस्थितिकी तंत्र) और आर्थिक भूगोल (संसाधन और कृषि) (Sem II)", marks: 20 },
          { name: "मानचित्र कार्य और सांख्यिकीय तकनीक (Sem II)", marks: 15 },
        ],
      },
      {
        name: "EVS (पर्यावरण अध्ययन)",
        totalMarks: 70,
        chapters: [
          { name: "मानव और पर्यावरण का संबंध, पर्यावरण के घटक (Sem I - MCQ)", marks: 18 },
          { name: "पर्यावरण प्रदूषण: कारण, प्रभाव और नियंत्रण उपाय (Sem I - MCQ)", marks: 17 },
          { name: "सतत विकास और प्राकृतिक संसाधन संरक्षण (Sem II)", marks: 20 },
          { name: "पर्यावरण कानून, नीतियां और समकालीन आंदोलन (Sem II)", marks: 15 },
        ],
      },
      {
        name: "History (इतिहास)",
        totalMarks: 80,
        chapters: [
          { name: "इतिहास लेखन की समझ, आदिम समाज और प्रारंभिक सभ्यताएं (Sem I - MCQ)", marks: 20 },
          { name: "साम्राज्यों का विकास और नगरों की स्थापना (यूनान, रोम, मौर्य) (Sem I - MCQ)", marks: 20 },
          { name: "मध्यकालीन समाज, सामंतवाद और अर्थव्यवस्था की संरचना (Sem II)", marks: 20 },
          { name: "आधुनिक युग की शुरुआत: पुनर्जागरण, धर्मसुधार और भौगोलिक खोजें (Sem II)", marks: 20 },
        ],
      },
      {
        name: "Hindi (हिंदी)",
        totalMarks: 80,
        chapters: [
          { name: "निर्धारित पाठ्यपुस्तक: गद्य और पद्य से बहुविकल्पीय प्रश्न (Sem I - MCQ)", marks: 25 },
          { name: "व्याकरण (भाषा, वर्ण, संज्ञा, सर्वनाम, क्रिया, विशेषण) (Sem I - MCQ)", marks: 15 },
          { name: "गद्य और पद्य की सप्रसंग व्याख्या एवं आलोचनात्मक प्रश्न (Sem II)", marks: 20 },
          { name: "रचनात्मक विधाएं: निबंध लेखन, पत्र लेखन और अपठित गद्यांश (Sem II)", marks: 20 },
        ],
      },
    ],
  },
  "12": {
    board: "WBCHSE (Higher Secondary - Board Exam)",
    subjects: [
      {
        name: "Political Science (राजनीति विज्ञान)",
        totalMarks: 80,
        chapters: [
          { name: "समकालीन विश्व राजनीति: शीतयुद्ध का दौर, वैश्वीकरण, अंतरराष्ट्रीय संगठन (Sem III - MCQ)", marks: 20 },
          { name: "भारतीय विदेश नीति और दक्षिण एशियाई पड़ोसियों के साथ संबंध (Sem III - MCQ)", marks: 20 },
          { name: "भारतीय सरकार: कार्यपालिका (राष्ट्रपति, प्रधानमंत्री) और विधायिका (संसद) (Sem IV)", marks: 20 },
          { name: "भारतीय न्यायपालिका (सर्वोच्च न्यायालय, उच्च न्यायालय) और समकालीन मुद्दे (Sem IV)", marks: 20 },
        ],
      },
      {
        name: "Education (शिक्षा शास्त्र)",
        totalMarks: 80,
        chapters: [
          { name: "स्वतंत्रता के बाद भारतीय शिक्षा का विकास (राधाकृष्णन, मुदालियर, कोठारी आयोग) (Sem III - MCQ)", marks: 20 },
          { name: "राष्ट्रीय शिक्षा नीति (NPE 1986 और हालिया संशोधन) (Sem III - MCQ)", marks: 20 },
          { name: "सीखने की प्रक्रिया (Mechanism of Learning) और प्रमुख सिद्धांत (Sem IV)", marks: 20 },
          { name: "शिक्षा में सांख्यिकी (Statistics in Education: मीन, मीडियन, मोड) (Sem IV)", marks: 20 },
        ],
      },
      {
        name: "Geography (भूगोल)",
        totalMarks: 70,
        chapters: [
          { name: "मानव भूगोल के मूल सिद्धांत: जनसंख्या, मानव बस्तियां (Sem III - MCQ)", marks: 18 },
          { name: "प्राथमिक, द्वितीयक और तृतीयक आर्थिक गतिविधियाँ (Sem III - MCQ)", marks: 17 },
          { name: "भारत और पश्चिम बंगाल का क्षेत्रीय भूगोल (भौतिक और आर्थिक पक्ष) (Sem IV)", marks: 20 },
          { name: "भौगोलिक डेटा का मानचित्रण, जीआईएस (GIS) और मानचित्र कार्य (Sem IV)", marks: 15 },
        ],
      },
      {
        name: "EVS (पर्यावरण अध्ययन)",
        totalMarks: 70,
        chapters: [
          { name: "जैव विविधता: महत्व, खतरे और इन-सीटू/एक्स-सीटू संरक्षण (Sem III - MCQ)", marks: 18 },
          { name: "पर्यावरण प्रबंधन और वैश्विक सम्मेलन (Sem III - MCQ)", marks: 17 },
          { name: "सतत कृषि और खाद्य सुरक्षा (Sem IV)", marks: 20 },
          { name: "घरेलू और औद्योगिक कचरा प्रबंधन, स्वच्छ ऊर्जा स्रोत (Sem IV)", marks: 15 },
        ],
      },
      {
        name: "History (इतिहास)",
        totalMarks: 80,
        chapters: [
          { name: "उपनिवेशवाद का प्रभाव: भू-राजस्व नीतियां, अर्थव्यवस्था का विखंडन (Sem III - MCQ)", marks: 20 },
          { name: "19वीं और 20वीं सदी के सामाजिक-धार्मिक सुधार आंदोलन (Sem III - MCQ)", marks: 20 },
          { name: "भारतीय राष्ट्रीय आंदोलन: गांधीवादी युग, भारत छोड़ो, आज़ाद हिंद फ़ौज (Sem IV)", marks: 20 },
          { name: "साम्राज्यवाद का अंत, भारत का विभाजन और नया गणतंत्र (Sem IV)", marks: 20 },
        ],
      },
      {
        name: "Hindi (हिंदी)",
        totalMarks: 80,
        chapters: [
          { name: "निर्धारित उच्च माध्यमिक गद्य और पद्य से वस्तुनिष्ठ प्रश्न (Sem III - MCQ)", marks: 25 },
          { name: "व्याकरण (समास, वाक्य-परिवर्तन, मुहावरे, अशुद्धि शोधन) (Sem III - MCQ)", marks: 15 },
          { name: "साहित्यिक व्याख्याएं, चरित्र-चित्रण और मूल भाव विश्लेषण (Sem IV)", marks: 20 },
          { name: "व्यावहारिक लेखन: प्रतिवेदन (Report), फीचर लेखन और निबंध (Sem IV)", marks: 20 },
        ],
      },
    ],
  },
}

const classes: ClassKey[] = ["8", "9", "10", "11", "12"]

export function SyllabusSection() {
  const [selectedClass, setSelectedClass] = useState<ClassKey>("8")
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([])

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    )
  }

  const currentSyllabus = syllabusData[selectedClass]

  return (
    <section id="syllabus" className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Detailed Curriculum
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[var(--font-playfair)] text-balance">
            Complete Syllabus
          </h2>
          <p className="mt-4 text-muted-foreground">
            Explore the detailed syllabus for each class with chapters and marks distribution
          </p>
        </div>

        {/* Class Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {classes.map((cls) => (
            <Button
              key={cls}
              variant={selectedClass === cls ? "default" : "outline"}
              size="lg"
              onClick={() => {
                setSelectedClass(cls)
                setExpandedSubjects([])
              }}
              className="min-w-[100px]"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Class {cls}
            </Button>
          ))}
        </div>

        {/* Board Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <FileText className="h-4 w-4" />
            <span>{currentSyllabus.board}</span>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid gap-4">
          {currentSyllabus.subjects.map((subject, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleSubject(subject.name)}
                className="w-full text-left"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Total Marks: {subject.totalMarks} (Written) + Project
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {subject.chapters.length} Chapters
                      </span>
                      {expandedSubjects.includes(subject.name) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>

              {expandedSubjects.includes(subject.name) && (
                <div className="border-t border-border">
                  <div className="p-4 md:p-6 bg-muted/30">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                              Chapter / Topic
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-foreground w-24">
                              Marks
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {subject.chapters.map((chapter, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-border/50 last:border-0"
                            >
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {chapter.name}
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-medium text-primary">
                                {chapter.marks}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-primary/5">
                            <td className="py-3 px-4 text-sm font-semibold text-foreground">
                              Total Written Marks
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-bold text-primary">
                              {subject.totalMarks}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Note:</strong> Each subject has an additional 10-20 marks for Project Work / Internal Assessment. 
            Passing requires minimum 25% marks (Written + Project combined).
          </p>
        </div>
      </div>
    </section>
  )
}
