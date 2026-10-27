import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput, useApp, useStdout } from "ink";
import {
  SITE_META,
  DIRECTORIES,
  KEYBOARD_SHORTCUTS,
  BIO_TEXT,
  PROJECTS,
  ABOUT_INTRO,
  ABOUT_SECTIONS,
  CONTACT_ITEMS,
  terminalLink,
  type DirectoryRoute,
} from "./content";
import { assciiText, asciiMEText, asciiPCText } from "./ascii-art";

const THEMES = ["cyan", "green", "yellow", "magenta", "blue"] as const;
type ThemeColor = (typeof THEMES)[number];

const GLITCH_SET = "!@#$%^&*░▒▓█▄▀╔╗╚╝║═<>[]{}|~±§";

export const App: React.FC = () => {
  const { exit } = useApp();
  const { stdout } = useStdout();

  // Terminal Dimensions with safe minimums
  const [size, setSize] = useState({
    columns: Math.max(stdout?.columns || 80, 40),
    rows: Math.max(stdout?.rows || 24, 15),
  });

  useEffect(() => {
    if (!stdout) return;
    const onResize = () => {
      setSize({
        columns: Math.max(stdout.columns || 80, 40),
        rows: Math.max(stdout.rows || 24, 15),
      });
    };

    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);

  // App Navigation & Themes
  const [screen, setScreen] = useState<"main" | DirectoryRoute>("main");
  const [themeIdx, setThemeIdx] = useState(0);
  const [dirIdx, setDirIdx] = useState(0);
  const [projIdx, setProjIdx] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [glitchedName, setGlitchedName] = useState(assciiText);

  const currentTheme: ThemeColor = THEMES[themeIdx] ?? "cyan";

  // Typewriter Animation
  useEffect(() => {
    if (screen !== "main") return;

    let i = 0;
    const interval = setInterval(() => {
      setTypedText(BIO_TEXT.slice(0, i));
      i++;
      if (i > BIO_TEXT.length) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [screen]);

  // Glitch Animation for ASCII Title
  useEffect(() => {
    if (screen !== "main") return;

    const interval = setInterval(() => {
      if (Math.random() < 0.08) {
        let f = 0;
        const frames = 4;
        const glitchInterval = setInterval(() => {
          setGlitchedName(
            [...assciiText]
              .map((c) =>
                c !== " " && c !== "\n" && Math.random() < 0.12
                  ? GLITCH_SET[Math.floor(Math.random() * GLITCH_SET.length)]
                  : c,
              )
              .join(""),
          );
          f++;
          if (f > frames) {
            clearInterval(glitchInterval);
            setGlitchedName(assciiText);
          }
        }, 40);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [screen]);

  // Keyboard Input Handling
  useInput((input, key) => {
    if (input === "q" || (input === "c" && key.ctrl)) {
      exit();
      return;
    }

    if (input === "t") {
      setThemeIdx((t) => (t + 1) % THEMES.length);
      return;
    }

    if (screen === "main") {
      if (key.leftArrow || input === "h") {
        setDirIdx((d) => (d - 1 + 3) % 3);
      } else if (key.rightArrow || input === "l") {
        setDirIdx((d) => (d + 1) % 3);
      } else if (key.return) {
        const routes: DirectoryRoute[] = ["about", "projects", "contact"];
        const target = routes[dirIdx];
        if (target) setScreen(target);
      }
    } else if (screen === "projects") {
      if (key.upArrow || input === "k") {
        setProjIdx((p) => (p - 1 + PROJECTS.length) % PROJECTS.length);
      } else if (key.downArrow || input === "j") {
        setProjIdx((p) => (p + 1) % PROJECTS.length);
      } else if (key.leftArrow || input === "h") {
        setProjIdx((p) => (p - 1 + PROJECTS.length) % PROJECTS.length);
      } else if (key.rightArrow || input === "l") {
        setProjIdx((p) => (p + 1) % PROJECTS.length);
      } else if (input >= "1" && input <= String(PROJECTS.length)) {
        setProjIdx(parseInt(input, 10) - 1);
      } else if (key.escape || key.backspace) {
        setScreen("main");
      }
    } else {
      if (key.escape || key.backspace) {
        setScreen("main");
      }
    }
  });

  // Responsive Layout Decision
  const isDesktop = size.columns >= 85 && size.rows >= 24;

  // Max lines available for middle content area so root strictly equals terminal rows
  const contentHeight = Math.max(size.rows - 2, 10);

  // Active ASCII art string without any carriage returns
  const currentAscii = (screen === "projects" ? asciiPCText : asciiMEText).replace(/\r/g, "");

  // Truncate ASCII lines so they strictly fit inside the left 50% box
  const halfColumns = Math.floor(size.columns / 2);
  const asciiRenderLines = useMemo(() => {
    const lines = currentAscii.split("\n");
    const maxLines = Math.min(lines.length, contentHeight);
    const maxCols = Math.max(halfColumns - 4, 10);
    return lines.slice(0, maxLines).map((line) => {
      const clean = line.replace(/\r/g, "");
      return clean.length > maxCols ? clean.slice(0, maxCols) : clean;
    });
  }, [currentAscii, halfColumns, contentHeight]);

  // Mobile Top ASCII Lines
  const mobileAsciiLines = useMemo(() => {
    const lines = currentAscii.split("\n");
    // Select key portrait rows
    const lineCount = Math.min(Math.max(contentHeight - 16, 6), 10);
    const targetCols = Math.max(size.columns - 4, 20);
    return lines.slice(3, 3 + lineCount).map((line) => {
      const clean = line.replace(/\r/g, "");
      if (clean.length <= targetCols) return clean;
      const start = Math.max(0, Math.floor((clean.length - targetCols) / 2));
      return clean.slice(start, start + targetCols);
    });
  }, [currentAscii, size.columns, contentHeight]);

  // ==========================================
  // VIEW COMPONENTS
  // ==========================================

  // Projects View
  const ProjectsView = () => {
    const selected = PROJECTS[projIdx] || PROJECTS[0]!;

    return (
      <Box flexDirection="column" width="100%">
        <Box marginBottom={1}>
          <Text color={currentTheme} bold>
            $ ls -la
          </Text>
        </Box>

        {/* Selected Project Card */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={currentTheme}
          paddingX={1}
          width="95%"
        >
          <Box justifyContent="space-between">
            <Text bold color={currentTheme}>
              {`${selected.num}. ${selected.name}`}
            </Text>
          </Box>

          <Box marginY={1}>
            <Text color="gray">
              {selected.tech.map((t) => `[${t}]`).join(" ")}
            </Text>
          </Box>

          <Box marginY={1} flexDirection="column">
            {selected.desc.map((d, i) => (
              <Text key={`desc-${selected.id}-${i}`} wrap="wrap">
                {d}
              </Text>
            ))}
          </Box>

          {/* Clickable GitHub Repository URL (OSC 8 client-side hyperlink) */}
          <Box marginTop={0} flexDirection="row">
            <Text color={currentTheme}>{"> "}</Text>
            <Text underline color="grey">
              {terminalLink(selected.url, selected.url)}
            </Text>
          </Box>
        </Box>

        {/* Project List / Navigator */}
        <Box flexDirection="column" marginTop={1}>
          {PROJECTS.map((p, i) => {
            const isSel = i === projIdx;
            return (
              <Box key={`proj-item-${p.id}`} gap={2}>
                <Text color={isSel ? currentTheme : "gray"}>
                  {isSel ? "▶" : " "}
                </Text>
                <Text color="gray">{`[${i + 1}]`}</Text>
                <Text
                  color={isSel ? currentTheme : undefined}
                  bold={isSel}
                  underline={isSel}
                >
                  {p.name}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // About View (Spaced Sections matching Contact)
  const AboutView = () => {
    // Spacing between sections: comfortable gap when height permits
    const useGap = contentHeight >= 22;

    return (
      <Box flexDirection="column" width="100%">
        <Box marginBottom={1}>
          <Text color={currentTheme} bold>
            $ whoami
          </Text>
        </Box>

        <Box flexDirection="column" gap={useGap ? 1 : 0}>
          {/* Intro Paragraph */}
          <Box flexDirection="column">
            {ABOUT_INTRO.map((line, idx) => (
              <Text key={`about-intro-${idx}`} wrap="wrap">
                {line}
              </Text>
            ))}
          </Box>

          {/* Subsections with clean vertical spacing matching Contact */}
          {ABOUT_SECTIONS.map((section) => (
            <Box key={`about-sec-${section.id}`} flexDirection="column">
              <Text color={currentTheme} bold>
                {section.title}
              </Text>
              <Box flexDirection="column" paddingLeft={2}>
                {section.items.map((item, itemIdx) => (
                  <Text key={`about-${section.id}-${itemIdx}`} wrap="wrap">
                    {item}
                  </Text>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Contact View (Clickable OSC 8 Links)
  const ContactView = () => (
    <Box flexDirection="column" width="100%">
      <Box marginBottom={1}>
        <Text color={currentTheme} bold>
          $ ifconfig -a
        </Text>
      </Box>
      <Box flexDirection="column" gap={1}>
        {CONTACT_ITEMS.map((item) => (
          <Box key={`contact-${item.id}`} flexDirection="column">
            <Text color={currentTheme} bold>
              {`▸ ${item.label}`}
            </Text>
            <Box paddingLeft={2} flexDirection="row">
              <Text underline color="white">
                {terminalLink(item.value, item.url)}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );

  // Main Home Content
  const MainHomeContent = () => (
    <Box flexDirection="column" width="100%">
      <Box marginBottom={1}>
        <Text color={currentTheme} bold>
          $ sudo init
        </Text>
      </Box>
      {/* ASCII Name Banner or compact text */}
      {size.columns >= 60 ? (
        <Box flexDirection="column">
          {glitchedName.split("\n").map((line, i) => (
            <Text key={`glitch-l-${i}`} color={currentTheme} bold wrap="truncate">
              {line}
            </Text>
          ))}
        </Box>
      ) : (
        <Box borderStyle="single" borderColor={currentTheme} paddingX={1}>
          <Text color={currentTheme} bold>
            [ RITESH ]
          </Text>
        </Box>
      )}

      {/* Typewriter bio */}
      <Box marginTop={1} width="95%">
        <Text wrap="wrap">{typedText}</Text>
      </Box>

      {/* Directory explore label */}
      <Box marginTop={1}>
        <Text color="gray">Explore the directories below:</Text>
      </Box>

      {/* Directory Navigation Buttons */}
      <Box marginTop={1} gap={2} flexDirection="row">
        {DIRECTORIES.map((label, i) => {
          const isSelected = dirIdx === i;
          return (
            <Text
              key={label}
              color={isSelected ? currentTheme : undefined}
              inverse={isSelected}
              bold={isSelected}
            >
              {` ${label} `}
            </Text>
          );
        })}
      </Box>
    </Box>
  );

  // Render Subscreen or Main
  const renderDynamicContent = () => {
    switch (screen) {
      case "about":
        return <AboutView />;
      case "projects":
        return <ProjectsView />;
      case "contact":
        return <ContactView />;
      case "main":
      default:
        return <MainHomeContent />;
    }
  };

  // ==========================================
  // ROOT RENDER
  // ==========================================
  return (
    <Box
      flexDirection="column"
      width={size.columns}
      height={size.rows}
      justifyContent="space-between"
    >
      {/* TOP NAVBAR (Clean, frameless) */}
      <Box
        justifyContent="space-between"
        paddingX={2}
        height={1}
        width="100%"
      >
        <Text color={currentTheme} bold>
          {SITE_META.domain} | {screen === "main" ? "~" : `~/${screen}`}
        </Text>
        <Text color={currentTheme}>{SITE_META.badge}</Text>
      </Box>

      {/* CENTER WORKSPACE */}
      {isDesktop ? (
        // ── DESKTOP 50% - 50% HORIZONTAL SPLIT ──
        <Box
          flexDirection="row"
          width="100%"
          height={contentHeight}
          alignItems="center"
          justifyContent="center"
        >
          {/* Left 50%: ASCII Art */}
          <Box
            width="50%"
            height={contentHeight}
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            {asciiRenderLines.map((line, i) => (
              <Text key={`ascii-l-${i}`} wrap="truncate">
                {line}
              </Text>
            ))}
          </Box>

          {/* Right 50%: Dynamic Content */}
          <Box
            width="50%"
            height={contentHeight}
            flexDirection="column"
            justifyContent="center"
          >
            {renderDynamicContent()}
          </Box>
        </Box>
      ) : (
        // ── MOBILE / COMPACT VERTICAL TOP-AND-BOTTOM STACK ──
        <Box
          flexDirection="column"
          width="100%"
          height={contentHeight}
          alignItems="center"
          justifyContent="center"
          paddingX={1}
        >
          {/* Top: ASCII Art for Mobile */}
          {size.rows >= 22 && (
            <Box
              marginBottom={1}
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              {mobileAsciiLines.map((line, i) => (
                <Text key={`m-ascii-${i}`} wrap="truncate">
                  {line}
                </Text>
              ))}
            </Box>
          )}

          {/* Bottom: Dynamic Content */}
          <Box flexDirection="column" width="100%" alignItems="center">
            {renderDynamicContent()}
          </Box>
        </Box>
      )}

      {/* BOTTOM FOOTER (Clean, frameless, always visible on row 1) */}
      <Box
        justifyContent="center"
        height={1}
        width="100%"
      >
        <Text color="gray">
          {KEYBOARD_SHORTCUTS[screen as keyof typeof KEYBOARD_SHORTCUTS] ||
            KEYBOARD_SHORTCUTS.main}
        </Text>
      </Box>
    </Box>
  );
};
