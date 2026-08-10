import {
    Card,
    CardContent,
    Box,
    Typography,
    IconButton,
    Stack,
    Tooltip,
} from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";

type TemplateCardProps = {
    name: string;
    createdAt: string;
    updatedAt: string;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
};

export default function TemplateCard({
    name,
    createdAt,
    updatedAt,
    onClick,
    onEdit,
}: TemplateCardProps) {
    return (
        <Card
            onClick={onClick}
            elevation={0}
            sx={{
                position: "relative",
                height: 180,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",

                cursor: "pointer",

                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,

                backgroundColor: "background.paper",

                transition:
                    "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.10)",
                    borderColor: "primary.light",
                },

                "&:hover .edit-button": {
                    opacity: 1,
                    transform: "scale(1)",
                },
            }}
        >
            {/* =========================
                Edit Button
            ========================= */}
            <Tooltip title="Edit template">
                <IconButton
                    className="edit-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(e);
                    }}
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 2,

                        width: 36,
                        height: 36,

                        opacity: 0,
                        transform: "scale(0.85)",

                        color: "text.secondary",
                        backgroundColor: "rgba(255,255,255,0.92)",

                        border: "1px solid",
                        borderColor: "divider",

                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",

                        transition:
                            "opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease",

                        "&:hover": {
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                        },
                    }}
                >
                    <EditOutlinedIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            {/* =========================
                Document Preview
            ========================= */}
            <Box
                sx={{
                    height: 155,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    position: "relative",

                    background:
                        "linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)",

                    borderBottom: "1px solid",
                    borderColor: "divider",

                    "&::before": {
                        content: '""',
                        position: "absolute",
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        opacity: 0.05,
                    },
                }}
            >
                <Box
                    sx={{
                        width: 78,
                        height: 92,

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        position: "relative",

                        backgroundColor: "background.paper",

                        borderRadius: 2,

                        border: "1px solid",
                        borderColor: "divider",

                        boxShadow:
                            "0 8px 20px rgba(0, 0, 0, 0.08)",

                        transform: "rotate(-2deg)",

                        transition: "transform 0.25s ease",

                        ".MuiCard-root:hover &": {
                            transform: "rotate(0deg) scale(1.05)",
                        },
                    }}
                >
                    <DescriptionOutlinedIcon
                        sx={{
                            fontSize: 52,
                            color: "primary.main",
                        }}
                    />
                </Box>
            </Box>

            {/* =========================
                Template Information
            ========================= */}
            <CardContent
                sx={{
                    flex: 1,
                    px: 2.25,
                    py: 2,

                    "&:last-child": {
                        pb: 2,
                    },
                }}
            >
                {/* Template Name */}
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    noWrap
                    title={name}
                    sx={{
                        color: "text.primary",
                        mb: 1.5,
                    }}
                >
                    {name}
                </Typography>

                {/* Metadata */}
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        color: "text.secondary",
                    }}
                >
                    {/* Created */}
                    <Box
                        sx={{
                            minWidth: 0,
                            flex: 1,
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
                            sx={{ mb: 0.5 }}
                        >
                            <CalendarTodayOutlinedIcon
                                sx={{ fontSize: 14 }}
                            />

                            <Typography
                                variant="caption"
                                fontWeight={600}
                            >
                                Created
                            </Typography>
                        </Stack>

                        <Typography
                            variant="caption"
                            noWrap
                            sx={{
                                color: "text.secondary",
                            }}
                        >
                            {createdAt}
                        </Typography>
                    </Box>

                    {/* Updated */}
                    <Box
                        sx={{
                            minWidth: 0,
                            flex: 1,
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
                            sx={{ mb: 0.5 }}
                        >
                            <UpdateOutlinedIcon
                                sx={{ fontSize: 14 }}
                            />

                            <Typography
                                variant="caption"
                                fontWeight={600}
                            >
                                Updated
                            </Typography>
                        </Stack>

                        <Typography
                            variant="caption"
                            noWrap
                            sx={{
                                color: "text.secondary",
                            }}
                        >
                            {updatedAt}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}