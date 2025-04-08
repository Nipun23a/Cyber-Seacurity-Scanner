import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Shield, 
  Lock, 
  FileText, 
  ExternalLink,
  Play,
  ShieldAlert,
  Fingerprint,
  Eye,
  KeyRound,
  MoveRight
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const threatCategories = [
    {
      id: "trojans",
      name: "Trojans",
      icon: <ShieldAlert className="h-12 w-12 text-red-500" />,
      description: "Malicious programs that disguise themselves as legitimate software",
      examples: ["Trojan.Generic", "Trojan.Downloader", "Trojan.Injector"],
      videoId: "061QRJa26kU?si=gvgdIv6BmiL_JQdD", // YouTube video ID for trojans
      preventionTips: [
        "Only download software from official sources",
        "Keep your operating system and applications updated",
        "Use a reputable antivirus solution",
        "Be cautious of email attachments from unknown senders"
      ],
      impactLevel: 85,
      color: "text-red-500"
    },
    {
      id: "ransomware",
      name: "Ransomware",
      icon: <Lock className="h-12 w-12 text-amber-500" />,
      description: "Malware that encrypts your files and demands payment for decryption",
      examples: ["Ransomware.WannaCry"],
      videoId: "lIsWpCMBxHQ?si=gdY8_x3JOUT0YZkb", // YouTube video ID for ransomware
      preventionTips: [
        "Regularly back up your important data",
        "Keep your operating system and applications updated",
        "Be careful when opening email attachments",
        "Use a reputable security solution"
      ],
      impactLevel: 95,
      color: "text-amber-500"
    },
    {
      id: "keyloggers",
      name: "Keyloggers",
      icon: <Fingerprint className="h-12 w-12 text-purple-500" />,
      description: "Software that records keystrokes to steal passwords and sensitive information",
      examples: ["Keylogger.Common"],
      videoId: "L8169DHNeQ0?si=iYLC184TJuwmvnK9", // YouTube video ID for keyloggers
      preventionTips: [
        "Use two-factor authentication",
        "Consider using a password manager",
        "Keep your operating system updated",
        "Scan your computer regularly for malware"
      ],
      impactLevel: 75,
      color: "text-purple-500"
    },
    {
      id: "spyware",
      name: "Spyware",
      icon: <Eye className="h-12 w-12 text-blue-500" />,
      description: "Malware that secretly monitors user activity and steals personal information",
      examples: ["Spyware.ScreenWatcher"],
      videoId: "ZgXw3WCNXc8?si=rB6W7iRB5AN5r2q7", // YouTube video ID for spyware
      preventionTips: [
        "Keep your browser and plugins updated",
        "Be cautious of free software that seems too good to be true",
        "Use privacy-focused browser extensions",
        "Run regular security scans"
      ],
      impactLevel: 70,
      color: "text-blue-500"
    },
    {
      id: "rootkits",
      name: "Rootkits",
      icon: <KeyRound className="h-12 w-12 text-green-600" />,
      description: "Stealthy malware that gives attackers unauthorized access to a computer",
      examples: ["Rootkit.StealthMode"],
      videoId: "jO9lDsNuyv4?si=kFuZEplRxrb3dkHF", // YouTube video ID for rootkits
      preventionTips: [
        "Keep your operating system up to date",
        "Use secure boot if your system supports it",
        "Employ a security solution with rootkit detection",
        "Be careful about what software you install"
      ],
      impactLevel: 90,
      color: "text-green-600"
    }
];

const securityPractices = [
    {
      title: "Keep Software Updated",
      description: "Regularly update your operating system and applications to protect against known vulnerabilities.",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: "Use Strong Passwords",
      description: "Create unique, complex passwords and consider using a password manager.",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      title: "Enable Two-Factor Authentication",
      description: "Add an extra layer of security to your accounts with 2FA whenever possible.",
      icon: <Fingerprint className="h-5 w-5" />,
    },
    {
      title: "Be Cautious with Attachments",
      description: "Don't open email attachments from unknown senders or suspicious messages.",
      icon: <AlertCircle className="h-5 w-5" />,
    },
    {
      title: "Backup Your Data",
      description: "Regularly backup important files to an external device or cloud storage.",
      icon: <FileText className="h-5 w-5" />,
    }
];

// YouTube video embed component
const YouTubeEmbed = ({ videoId }) => (
    <div className="relative pb-16 h-0" style={{ paddingBottom: "56.25%" }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
);
  


  
function SecurityEducationPage() {
    const [progress, setProgress] = useState(0);
    const [selectedThreat, setSelectedThreat] = useState(threatCategories[0]);
    const [completed, setCompleted] = useState([]);
  
    useEffect(() => {
      // Simulate progress based on completed sections
      const newProgress = (completed.length / (threatCategories.length + 1)) * 100;
      setProgress(newProgress);
    }, [completed]);
  
    const markAsCompleted = (sectionId) => {
      if (!completed.includes(sectionId)) {
        setCompleted([...completed, sectionId]);
      }
    };
  
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          when: "beforeChildren",
          staggerChildren: 0.3
        }
      }
    };
  
    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
      }
    };
  
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Security Education Center</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Learn about common security threats, how to identify them, and best practices to keep your system safe.
          </p>
          
          {/* Progress indicator */}
          <div className="max-w-md mx-auto mt-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Your security knowledge</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </motion.div>
  
        {/* Alert for special recommendation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Alert className="border-blue-500 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle>Security Recommendation</AlertTitle>
            <AlertDescription>
              Based on your recent scan, we recommend reviewing the information about {threatCategories[0].name} to better
              protect your system.
            </AlertDescription>
          </Alert>
        </motion.div>
  
        {/* Main Tabs Content */}
        <Tabs defaultValue="threats" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="threats">Security Threats</TabsTrigger>
            <TabsTrigger value="bestPractices">Best Practices</TabsTrigger>
            <TabsTrigger value="quiz">Security Quiz</TabsTrigger>
          </TabsList>
  
          {/* Threats Content */}
          <TabsContent value="threats">
            <motion.div 
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Left column - Threat categories */}
              <motion.div variants={itemVariants} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Security Threats</CardTitle>
                    <CardDescription>Select a category to learn more</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {threatCategories.map((threat) => (
                      <motion.div 
                        key={threat.id}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          selectedThreat.id === threat.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedThreat(threat)}
                      >
                        <div className="mr-4">
                          {threat.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{threat.name}</h3>
                          <p className="text-sm text-gray-500">{threat.description}</p>
                        </div>
                        {completed.includes(threat.id) && (
                          <Badge variant="outline" className="ml-auto bg-green-50 text-green-600 border-green-200">
                            Completed
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
  
              {/* Right column - Selected threat details */}
              <motion.div 
                variants={itemVariants}
                key={selectedThreat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="mr-4">
                        {selectedThreat.icon}
                      </div>
                      <div>
                        <CardTitle>{selectedThreat.name}</CardTitle>
                        <CardDescription>{selectedThreat.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Threat details */}
                    <div>
                      <h4 className="font-medium mb-2">Impact Level</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedThreat.impactLevel} className="h-2" />
                        <span className="text-sm font-medium">{selectedThreat.impactLevel}%</span>
                      </div>
                    </div>
  
                    {/* Examples found in your system */}
                    <div>
                      <h4 className="font-medium mb-2">Examples detected in systems:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedThreat.examples.map((example) => (
                          <Badge key={example} variant="secondary">{example}</Badge>
                        ))}
                      </div>
                    </div>
  
                    {/* Prevention tips */}
                    <div>
                      <h4 className="font-medium mb-2">How to protect yourself:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedThreat.preventionTips.map((tip, index) => (
                          <li key={index} className="text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>
  
                    {/* Video tutorial */}
                    <div>
                      <h4 className="font-medium mb-2">Watch and learn:</h4>
                      <YouTubeEmbed videoId={selectedThreat.videoId} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => markAsCompleted(selectedThreat.id)}
                      disabled={completed.includes(selectedThreat.id)}
                      className="w-full"
                    >
                      {completed.includes(selectedThreat.id) ? "Completed" : "Mark as Completed"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
  
          {/* Best Practices Content */}
          <TabsContent value="bestPractices">
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Security Best Practices</CardTitle>
                    <CardDescription>Essential habits to maintain your digital security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {securityPractices.map((practice, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>
                            <div className="flex items-center">
                              <div className="mr-3 p-2 rounded-full bg-blue-50">
                                {practice.icon}
                              </div>
                              <span>{practice.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-11 pr-4 pt-2">
                              <p className="text-gray-600">{practice.description}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => markAsCompleted('best-practices')}
                      disabled={completed.includes('best-practices')}
                      className="w-full"
                    >
                      {completed.includes('best-practices') ? "Completed" : "Mark as Completed"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
  
              {/* Daily security habits */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Security Habits</CardTitle>
                    <CardDescription>Simple actions that significantly improve your security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start p-4 border rounded-lg">
                        <div className="p-2 mr-4 rounded-full bg-green-50">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Check for updates</h3>
                          <p className="text-sm text-gray-500">Take 5 minutes each day to check for and install any pending updates for your operating system and applications.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 border rounded-lg">
                        <div className="p-2 mr-4 rounded-full bg-amber-50">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Verify before clicking</h3>
                          <p className="text-sm text-gray-500">Always hover over links to verify their destination before clicking, particularly in emails and messages.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 border rounded-lg">
                        <div className="p-2 mr-4 rounded-full bg-blue-50">
                          <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Lock your devices</h3>
                          <p className="text-sm text-gray-500">Get into the habit of locking your devices whenever you step away, even if just for a minute.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
  
          {/* Security Quiz Content */}
          <TabsContent value="quiz">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
            <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Test Your Security Knowledge</CardTitle>
                    <CardDescription>See how much you've learned about cybersecurity</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Play className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">Ready to test your knowledge?</h3>
                    <p className="text-gray-500 mb-6">This quiz will test your understanding of common threats and security best practices.</p>
                    <Button>
                      Start Quiz <MoveRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
            </motion.div>
        </motion.div>
        </TabsContent>
        </Tabs>
  
        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Additional Security Resources</CardTitle>
              <CardDescription>Learn more about cybersecurity from these trusted sources</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                    <a
                    href="https://www.coursera.org/learn/cyber-security-domain"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <Button variant="outline" className="flex justify-between w-full">
                        <span>Cybersecurity Fundamentals</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                    </a>

                    <a
                    href="https://www.phishing.org/10-ways-to-avoid-phishing-scams"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <Button variant="outline" className="flex justify-between w-full">
                        <span>Identifying Phishing Attempts</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                    </a>

                    <a
                    href="https://www.cyber.gov.au/acsc/view-all-content/publications/password-security"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <Button variant="outline" className="flex justify-between w-full">
                        <span>Password Security Guidelines</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                    </a>

                    <a
                    href="https://www.consumer.ftc.gov/articles/how-secure-your-home-wi-fi-network"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <Button variant="outline" className="flex justify-between w-full">
                        <span>Home Network Protection</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                    </a>
                </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
}
  
export default SecurityEducationPage;