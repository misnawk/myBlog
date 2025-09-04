import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  Fade,
  Zoom,
  Drawer,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";

const Chating = () => {
  // 현재 사용자 정보 (실제로는 AuthContext에서 가져와야 함)
  const currentUser = {
    id: 1,
    name: "김민수",
    email: "kms13@example.com",
    avatar: "👤",
    isOnline: true,
  };

  // 사용자 목록 (실제로는 API에서 가져와야 함)
  const [users] = useState([
    {
      id: 1,
      name: "김민수",
      email: "kms13@example.com",
      avatar: "👤",
      isOnline: true,
    },
    {
      id: 2,
      name: "이영희",
      email: "yh@example.com",
      avatar: "👩",
      isOnline: true,
    },
    {
      id: 3,
      name: "박철수",
      email: "cs@example.com",
      avatar: "👨",
      isOnline: false,
    },
    {
      id: 4,
      name: "최지영",
      email: "jy@example.com",
      avatar: "👩‍💼",
      isOnline: true,
    },
    {
      id: 5,
      name: "정민호",
      email: "mh@example.com",
      avatar: "👨‍💻",
      isOnline: false,
    },
  ]);

  // 채팅방 목록
  const [chatRooms, setChatRooms] = useState([
    {
      id: 1,
      name: "일반 채팅",
      type: "group",
      participants: [1, 2, 3, 4, 5],
      lastMessage: "안녕하세요! 오늘 날씨가 좋네요.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
      unreadCount: 2,
    },
    {
      id: 2,
      name: "개발팀",
      type: "group",
      participants: [1, 4, 5],
      lastMessage: "코드 리뷰 부탁드립니다.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
      unreadCount: 0,
    },
  ]);

  // 현재 선택된 채팅방
  const [selectedChatRoom, setSelectedChatRoom] = useState(chatRooms[0]);

  // 메시지 목록
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! 오늘 날씨가 좋네요.",
      senderId: 2,
      senderName: "이영희",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      avatar: "👩",
    },
    {
      id: 2,
      text: "네, 정말 좋은 날씨입니다! 산책하기 딱 좋을 것 같아요.",
      senderId: 1,
      senderName: "김민수",
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      avatar: "👤",
    },
    {
      id: 3,
      text: "저도 그렇게 생각해요. 오후에 나가볼까요?",
      senderId: 4,
      senderName: "최지영",
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      avatar: "👩‍💼",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [createRoomDialog, setCreateRoomDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      senderId: currentUser.id,
      senderName: currentUser.name,
      timestamp: new Date(),
      avatar: currentUser.avatar,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // 채팅방의 마지막 메시지 업데이트
    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === selectedChatRoom.id
          ? {
              ...room,
              lastMessage: inputText,
              lastMessageTime: new Date(),
              unreadCount:
                room.id === selectedChatRoom.id ? 0 : room.unreadCount + 1,
            }
          : room
      )
    );
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim() || selectedUsers.length === 0) return;

    const newRoom = {
      id: Date.now(),
      name: newRoomName,
      type: "group",
      participants: [currentUser.id, ...selectedUsers],
      lastMessage: "채팅방이 생성되었습니다.",
      lastMessageTime: new Date(),
      unreadCount: 0,
    };

    setChatRooms((prev) => [newRoom, ...prev]);
    setSelectedChatRoom(newRoom);
    setNewRoomName("");
    setSelectedUsers([]);
    setCreateRoomDialog(false);
  };

  const handleSelectChatRoom = (room) => {
    setSelectedChatRoom(room);
    // 읽음 처리
    setChatRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, unreadCount: 0 } : r))
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      {/* 사이드바 */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: 320,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 320,
            boxSizing: "border-box",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        {/* 사이드바 헤더 */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: "primary.main",
            color: "white",
            borderRadius: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "white", color: "primary.main" }}>
              <ChatIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                채팅
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {users.filter((u) => u.isOnline).length}명 온라인
              </Typography>
            </Box>
            <IconButton
              sx={{ color: "white" }}
              onClick={() => setCreateRoomDialog(true)}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* 채팅방 목록 */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <List>
            {chatRooms.map((room) => (
              <ListItem
                key={room.id}
                button
                selected={selectedChatRoom?.id === room.id}
                onClick={() => handleSelectChatRoom(room)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                          border: "2px solid white",
                        }}
                      />
                    }
                  >
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <GroupIcon />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {room.name}
                      </Typography>
                      {room.unreadCount > 0 && (
                        <Chip
                          label={room.unreadCount}
                          size="small"
                          color="primary"
                          sx={{ minWidth: 20, height: 20, fontSize: "0.75rem" }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {room.lastMessage}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {room.lastMessageTime.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 사용자 목록 */}
        <Box sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            온라인 사용자
          </Typography>
          <List dense>
            {users
              .filter((user) => user.isOnline)
              .map((user) => (
                <ListItem key={user.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "success.main",
                            border: "1px solid white",
                          }}
                        />
                      }
                    >
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {user.avatar}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="medium">
                        {user.name}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>

      {/* 메인 채팅 영역 */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* 채팅 헤더 */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            bgcolor: "white",
            borderBottom: "1px solid #e0e0e0",
            borderRadius: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ display: { xs: "block", sm: "none" } }}
            >
              <ChatIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <GroupIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {selectedChatRoom?.name || "채팅방을 선택하세요"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedChatRoom?.participants?.length || 0}명 참여 중
              </Typography>
            </Box>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* 메시지 영역 */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "grey.50",
          }}
        >
          {selectedChatRoom ? (
            <>
              {messages.map((message, index) => (
                <Fade in={true} timeout={500} key={message.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        message.senderId === currentUser.id
                          ? "flex-end"
                          : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection:
                          message.senderId === currentUser.id
                            ? "row-reverse"
                            : "row",
                        alignItems: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor:
                            message.senderId === currentUser.id
                              ? "primary.main"
                              : "grey.300",
                          color:
                            message.senderId === currentUser.id
                              ? "white"
                              : "grey.700",
                        }}
                      >
                        {message.avatar}
                      </Avatar>

                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor:
                            message.senderId === currentUser.id
                              ? "primary.main"
                              : "white",
                          color:
                            message.senderId === currentUser.id
                              ? "white"
                              : "text.primary",
                          borderRadius: 3,
                          position: "relative",
                          "&::before":
                            message.senderId === currentUser.id
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  right: -8,
                                  bottom: 12,
                                  width: 0,
                                  height: 0,
                                  borderLeft: "8px solid",
                                  borderLeftColor: "primary.main",
                                  borderTop: "8px solid transparent",
                                  borderBottom: "8px solid transparent",
                                }
                              : {
                                  content: '""',
                                  position: "absolute",
                                  left: -8,
                                  bottom: 12,
                                  width: 0,
                                  height: 0,
                                  borderRight: "8px solid",
                                  borderRightColor: "white",
                                  borderTop: "8px solid transparent",
                                  borderBottom: "8px solid transparent",
                                },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {message.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            display: "block",
                            mt: 0.5,
                            textAlign:
                              message.senderId === currentUser.id
                                ? "right"
                                : "left",
                          }}
                        >
                          {message.timestamp.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                </Fade>
              ))}

              {isTyping && (
                <Zoom in={true}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: "grey.300" }}
                      >
                        🤖
                      </Avatar>
                      <Paper
                        elevation={1}
                        sx={{ p: 2, bgcolor: "white", borderRadius: 3 }}
                      >
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "grey.400",
                              animation: "typing 1.4s infinite ease-in-out",
                            }}
                          />
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "grey.400",
                              animation:
                                "typing 1.4s infinite ease-in-out 0.2s",
                            }}
                          />
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "grey.400",
                              animation:
                                "typing 1.4s infinite ease-in-out 0.4s",
                            }}
                          />
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                </Zoom>
              )}

              <div ref={messagesEndRef} />
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <ChatIcon sx={{ fontSize: 64, color: "grey.400" }} />
              <Typography variant="h6" color="text.secondary">
                채팅방을 선택하세요
              </Typography>
              <Typography variant="body2" color="text.secondary">
                왼쪽 사이드바에서 채팅방을 선택하거나 새로 만들어보세요
              </Typography>
            </Box>
          )}
        </Box>

        {/* 입력 영역 */}
        {selectedChatRoom && (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: "white",
              borderRadius: 0,
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <IconButton size="small" sx={{ color: "grey.500" }}>
                <AttachFileIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: "grey.500" }}>
                <EmojiIcon />
              </IconButton>

              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "grey.50",
                  },
                }}
              />

              <IconButton
                onClick={handleSend}
                disabled={!inputText.trim()}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "grey.300" },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        )}
      </Box>

      {/* 채팅방 생성 다이얼로그 */}
      <Dialog
        open={createRoomDialog}
        onClose={() => setCreateRoomDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>새 채팅방 만들기</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="채팅방 이름"
            fullWidth
            variant="outlined"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>참여자 선택</InputLabel>
            <Select
              multiple
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const user = users.find((u) => u.id === value);
                    return (
                      <Chip
                        key={value}
                        label={user?.name}
                        size="small"
                        avatar={
                          <Avatar sx={{ width: 20, height: 20 }}>
                            {user?.avatar}
                          </Avatar>
                        }
                      />
                    );
                  })}
                </Box>
              )}
            >
              {users
                .filter((user) => user.id !== currentUser.id)
                .map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {user.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.isOnline ? "온라인" : "오프라인"}
                    />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRoomDialog(false)}>취소</Button>
          <Button
            onClick={handleCreateRoom}
            variant="contained"
            disabled={!newRoomName.trim() || selectedUsers.length === 0}
          >
            생성
          </Button>
        </DialogActions>
      </Dialog>

      {/* 타이핑 애니메이션 CSS */}
      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
          }
        `}
      </style>
    </Box>
  );
};

export default Chating;
