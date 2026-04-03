import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Treemap,
} from "recharts";

// ============================================
// DATA PARSER
// ============================================

function parseInfracostJSON(raw) {
  try {
    var data = typeof raw === "string" ? JSON.parse(raw) : raw;
    var project = data.projects && data.projects[0];
    if (!project) throw new Error("No project found");

    var breakdown = project.breakdown || project.pastBreakdown;
    var resources = (breakdown && breakdown.resources) || [];
    var serviceMap = {};
    var moduleMap = {};

    resources.forEach(function (r) {
      if (!r.monthlyCost || parseFloat(r.monthlyCost) === 0) return;
      var cost = parseFloat(r.monthlyCost);
      var moduleName = extractModule(r.name);
      var serviceName = extractServiceName(r);

      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = {
          name: serviceName,
          module: moduleName,
          cost: 0,
          type: guessType(r),
          icon: guessIcon(r),
        };
      }
      serviceMap[serviceName].cost += cost;

      if (!moduleMap[moduleName]) {
        moduleMap[moduleName] = {
          name: moduleName,
          label: formatModuleName(moduleName),
          cost: 0,
        };
      }
      moduleMap[moduleName].cost += cost;
    });

    var breakdownArr = Object.values(serviceMap).sort(function (a, b) {
      return b.cost - a.cost;
    });
    var modulesArr = Object.values(moduleMap).sort(function (a, b) {
      return b.cost - a.cost;
    });
    var total = parseFloat(data.totalMonthlyCost || "0");
    var usageCost = parseFloat(data.totalMonthlyUsageCost || "0");

    return {
      total: total,
      baseline: total - usageCost,
      usage: usageCost,
      currency: data.currency || "USD",
      resources: {
        detected: (data.summary && data.summary.totalDetectedResources) || 0,
        estimated: (data.summary && data.summary.totalSupportedResources) || 0,
        free: (data.summary && data.summary.totalNoPriceResources) || 0,
      },
      generated: data.timeGenerated || new Date().toISOString(),
      branch: (data.metadata && data.metadata.vcsBranch) || "unknown",
      commit:
        data.metadata && data.metadata.vcsCommitSha
          ? data.metadata.vcsCommitSha.slice(0, 7)
          : "",
      breakdown: breakdownArr,
      modules: modulesArr,
      finopsScore: calculateFinOpsScore(breakdownArr, total),
    };
  } catch (e) {
    console.error("Parse error:", e);
    return null;
  }
}

function extractModule(name) {
  var m = name.match(/^module\.(\w+)\./);
  return m ? m[1] : "other";
}

function extractServiceName(r) {
  var map = {
    aws_nat_gateway: "NAT Gateway",
    aws_mq_broker: "Amazon MQ (RabbitMQ)",
    aws_db_instance: "RDS PostgreSQL",
    aws_elasticache_cluster: "ElastiCache Redis",
    aws_instance: "EC2 Bastion",
    aws_cloudwatch_log_group: "CloudWatch Logs",
    aws_secretsmanager_secret: "Secrets Manager",
    aws_lambda_function: "Lambda Functions",
    aws_route53_zone: "Route53 DNS",
    aws_route53_record: "Route53 Records",
    aws_apigatewayv2_api: "API Gateway",
  };
  return (
    map[r.resourceType] ||
    (r.resourceType || "unknown").replace(/^aws_/, "").replace(/_/g, " ")
  );
}

function guessType(r) {
  var usageBased = [
    "aws_lambda_function",
    "aws_cloudwatch_log_group",
    "aws_apigatewayv2_api",
    "aws_route53_record",
  ];
  return usageBased.indexOf(r.resourceType) >= 0 ? "usage" : "fixed";
}

function guessIcon(r) {
  var map = {
    aws_nat_gateway: "\uD83C\uDF10",
    aws_mq_broker: "\uD83D\uDCE8",
    aws_db_instance: "\uD83D\uDDC4\uFE0F",
    aws_elasticache_cluster: "\u26A1",
    aws_instance: "\uD83D\uDD10",
    aws_cloudwatch_log_group: "\uD83D\uDCCB",
    aws_secretsmanager_secret: "\uD83D\uDD11",
    aws_lambda_function: "\u2699\uFE0F",
    aws_route53_zone: "\uD83C\uDF0D",
    aws_route53_record: "\uD83C\uDF0D",
    aws_apigatewayv2_api: "\uD83D\uDEAA",
  };
  return map[r.resourceType] || "\uD83D\uDCE6";
}

function formatModuleName(n) {
  var map = {
    networking: "Networking",
    lambda: "Lambda + Logs",
    messaging: "Messaging",
    database: "Database",
    cache: "Cache",
    bastion: "Bastion",
    secrets: "Secrets",
    dns: "DNS",
    api_gateway: "API Gateway",
    "api-gateway": "API Gateway",
    frontend: "Frontend",
  };
  return map[n] || n.charAt(0).toUpperCase() + n.slice(1);
}

function calculateFinOpsScore(breakdown, total) {
  function getCost(names) {
    return breakdown
      .filter(function (b) {
        return names.indexOf(b.name) >= 0;
      })
      .reduce(function (s, b) {
        return s + b.cost;
      }, 0);
  }

  var compute = getCost(["EC2 Bastion", "Lambda Functions"]);
  var network = getCost(["NAT Gateway"]);
  var serverless = getCost(["Lambda Functions"]);
  var logs = getCost(["CloudWatch Logs"]);
  var storage = getCost(["RDS PostgreSQL", "ElastiCache Redis"]);

  function score(cost, lo, hi) {
    return cost < lo ? 90 : cost < hi ? 65 : 38;
  }

  var networkPct = total > 0 ? network / total : 0;

  var categories = [
    {
      name: "Compute",
      score: score(compute, 15, 30),
      tip:
        compute < 15
          ? "t3.micro instances are cost-effective"
          : "Consider Reserved Instances",
    },
    {
      name: "Networking",
      score: networkPct < 0.2 ? 82 : networkPct < 0.3 ? 48 : 30,
      tip: "NAT Gateway = " + (networkPct * 100).toFixed(0) + "% do total",
    },
    {
      name: "Serverless",
      score: score(serverless, 5, 20),
      tip: "Lambda custa $" + serverless.toFixed(2) + "/mes",
    },
    {
      name: "Observability",
      score: score(logs, 10, 25),
      tip:
        logs > 10 ? "Reduza retencao dos CloudWatch Logs" : "Log costs OK",
    },
    {
      name: "Storage",
      score: score(storage, 20, 40),
      tip: storage < 20 ? "Storage bem otimizado" : "Revise sizing do RDS",
    },
  ];

  var overall = Math.round(
    categories.reduce(function (s, c) {
      return s + c.score;
    }, 0) / categories.length
  );

  return { overall: overall, categories: categories };
}

// ============================================
// CONSTANTS & HELPERS
// ============================================

var COLORS = [
  "#818cf8",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#f87171",
  "#a78bfa",
  "#f472b6",
  "#2dd4bf",
  "#fb923c",
  "#94a3b8",
];

function scoreColor(s) {
  return s >= 75 ? "#34d399" : s >= 50 ? "#fbbf24" : "#f87171";
}

function fmt(v) {
  return "$" + (Number(v) || 0).toFixed(2);
}

var cardStyle = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 14,
  padding: 24,
};

// ============================================
// SUB COMPONENTS
// ============================================

function ScoreRing(props) {
  var sc = props.score;
  var size = 130;
  var sw = 10;
  var r = (size - sw) / 2;
  var circ = 2 * Math.PI * r;
  var offset = circ - (sc / 100) * circ;
  var col = scoreColor(sc);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={sw}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={sw}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "center",
          fontSize: 34,
          fontWeight: 800,
          fill: col,
        }}
      >
        {sc}
      </text>
    </svg>
  );
}

function ChartTip(props) {
  if (!props.active || !props.payload || !props.payload.length) return null;
  var d = props.payload[0].payload;
  var val =
    d.cost !== undefined
      ? d.cost
      : d.value !== undefined
        ? d.value
        : props.payload[0].value;

  return (
    <div
      style={{
        background: "rgba(8,11,20,0.97)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>
        {d.name || d.label}
      </div>
      <div style={{ color: "#818cf8", fontSize: 14, marginTop: 3 }}>
        {fmt(val)}/mo
      </div>
    </div>
  );
}

function TreeCell(props) {
  var x = props.x;
  var y = props.y;
  var w = props.width;
  var h = props.height;
  var name = props.name;
  var cost = props.cost;
  var index = props.index;

  if (w < 40 || h < 32) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={COLORS[index % COLORS.length]}
        fillOpacity={0.78}
        stroke="rgba(8,11,20,0.7)"
        strokeWidth={2}
      />
      {w > 55 && h > 44 && (
        <React.Fragment>
          <text
            x={x + 12}
            y={y + 24}
            fill="#fff"
            fontSize={w > 120 ? 16 : w > 80 ? 14 : 12}
            fontWeight={700}
          >
            {name}
          </text>
          <text
            x={x + 12}
            y={y + 46}
            fill="rgba(255,255,255,0.65)"
            fontSize={w > 120 ? 15 : 13}
            fontWeight={600}
          >
            {fmt(cost)}
          </text>
        </React.Fragment>
      )}
    </g>
  );
}

// ============================================
// MAIN DASHBOARD
// ============================================

export default function FinOpsDashboard() {
  var _s1 = useState(null);
  var data = _s1[0];
  var setData = _s1[1];

  var _s2 = useState("overview");
  var view = _s2[0];
  var setView = _s2[1];

  var _s3 = useState(null);
  var hovered = _s3[0];
  var setHovered = _s3[1];

  var _s4 = useState(false);
  var dragOver = _s4[0];
  var setDragOver = _s4[1];

  var _s5 = useState(null);
  var error = _s5[0];
  var setError = _s5[1];

  var _s6 = useState(false);
  var loading = _s6[0];
  var setLoading = _s6[1];

  var fileRef = useRef(null);

  var handleFile = useCallback(function (file) {
    if (!file) return;
    setLoading(true);
    setError(null);
    var reader = new FileReader();
    reader.onload = function (e) {
      var parsed = parseInfracostJSON(e.target.result);
      if (parsed) {
        setData(parsed);
        setLoading(false);
      } else {
        setError("JSON invalido - verifique se eh output do Infracost");
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }, []);

  var onDrop = useCallback(
    function (e) {
      e.preventDefault();
      setDragOver(false);
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files[0]) handleFile(files[0]);
    },
    [handleFile]
  );

  var sorted = useMemo(
    function () {
      return data
        ? data.breakdown.slice().sort(function (a, b) {
            return b.cost - a.cost;
          })
        : [];
    },
    [data]
  );

  var treeData = useMemo(
    function () {
      return data
        ? data.modules.map(function (m) {
            return {
              name: m.name,
              label: m.label,
              cost: m.cost,
              value: m.cost,
            };
          })
        : [];
    },
    [data]
  );

  // ======================================================
  // UPLOAD SCREEN
  // ======================================================

  if (!data) {
    return (
      <div
        style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          background:
            "linear-gradient(160deg, #080b14 0%, #0f1629 40%, #0c1220 100%)",
          minHeight: "100vh",
          color: "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />

        <div style={{ textAlign: "center", maxWidth: 540, padding: 28 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "linear-gradient(135deg, #818cf8, #6366f1)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              marginBottom: 24,
              boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
            }}
          >
            {"\uD83D\uDCB0"}
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 900,
              margin: "0 0 8px",
              letterSpacing: "-0.03em",
            }}
          >
            FastMeals FinOps
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: 16,
              margin: "0 0 32px",
              lineHeight: 1.7,
            }}
          >
            Upload do JSON do Infracost para visualizar o dashboard de custos da
            infraestrutura AWS.
          </p>

          <div
            onDrop={onDrop}
            onDragOver={function (e) {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={function () {
              setDragOver(false);
            }}
            onClick={function () {
              fileRef.current && fileRef.current.click();
            }}
            style={{
              border:
                "2px dashed " +
                (dragOver ? "#818cf8" : "rgba(255,255,255,0.08)"),
              borderRadius: 16,
              padding: "52px 32px",
              cursor: "pointer",
              background: dragOver
                ? "rgba(129,140,248,0.05)"
                : "rgba(255,255,255,0.015)",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 12 }}>
              {"\uD83D\uDCC1"}
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
              {loading
                ? "Processando..."
                : "Arraste o JSON ou clique para selecionar"}
            </div>
            <div style={{ color: "#475569", fontSize: 14 }}>
              Gerado por{" "}
              <code
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                generate-cost-report.sh
              </code>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={function (e) {
                handleFile(e.target.files && e.target.files[0]);
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.15)",
                borderRadius: 10,
                color: "#f87171",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ======================================================
  // KPI DATA
  // ======================================================

  var kpis = [
    {
      label: "Total Mensal",
      value: fmt(data.total),
      sub: fmt(data.total * 12) + "/ano",
      color: "#818cf8",
      icon: "\uD83D\uDCCA",
    },
    {
      label: "Custo Fixo",
      value: fmt(data.baseline),
      sub: ((data.baseline / data.total) * 100).toFixed(0) + "% do total",
      color: "#60a5fa",
      icon: "\uD83D\uDD12",
    },
    {
      label: "Custo Variavel",
      value: fmt(data.usage),
      sub: ((data.usage / data.total) * 100).toFixed(0) + "% do total",
      color: "#fbbf24",
      icon: "\uD83D\uDCC8",
    },
    {
      label: "Recursos Cloud",
      value: String(data.resources.detected),
      sub:
        data.resources.estimated +
        " estimados / " +
        data.resources.free +
        " gratuitos",
      color: "#34d399",
      icon: "\u2601\uFE0F",
    },
  ];

  // ======================================================
  // DASHBOARD
  // ======================================================

  return (
    <div
      style={{
        fontFamily: "'Outfit', system-ui, sans-serif",
        background:
          "linear-gradient(160deg, #080b14 0%, #0f1629 40%, #0c1220 100%)",
        minHeight: "100vh",
        color: "#e2e8f0",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* ==================== HEADER ==================== */}
      <div
        style={{
          background: "rgba(255,255,255,0.015)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          padding: "20px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: "linear-gradient(135deg, #818cf8, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 3px 12px rgba(99,102,241,0.25)",
            }}
          >
            {"\uD83D\uDCB0"}
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              FastMeals FinOps
            </h1>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
              {new Date(data.generated).toLocaleDateString("pt-BR")} | branch:{" "}
              {data.branch} {data.commit ? "| " + data.commit : ""}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {[
              ["overview", "Overview"],
              ["modules", "Modules"],
              ["details", "Details"],
            ].map(function (t) {
              return (
                <button
                  key={t[0]}
                  onClick={function () {
                    setView(t[0]);
                  }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    background:
                      view === t[0]
                        ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                        : "transparent",
                    color: view === t[0] ? "#fff" : "#64748b",
                    transition: "all 0.2s",
                  }}
                >
                  {t[1]}
                </button>
              );
            })}
          </div>

          <button
            onClick={function () {
              setData(null);
              setError(null);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 7,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            Novo
          </button>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div
        style={{ padding: "28px 36px", maxWidth: 1440, margin: "0 auto" }}
      >
        {/* ========== KPI CARDS ========== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {kpis.map(function (c, i) {
            return (
              <div
                key={i}
                style={{ ...cardStyle, position: "relative", overflow: "hidden" }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -24,
                    right: -24,
                    width: 88,
                    height: 88,
                    background: c.color,
                    opacity: 0.04,
                    borderRadius: "50%",
                    filter: "blur(8px)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {c.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: c.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {c.value}
                </div>
                <div style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>
                  {c.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* ========== OVERVIEW TAB ========== */}
        {view === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {/* Donut Chart */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>
                Distribuicao de Custos
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <ResponsiveContainer width="50%" height={280}>
                  <PieChart>
                    <Pie
                      data={sorted}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={115}
                      paddingAngle={2}
                      dataKey="cost"
                      strokeWidth={0}
                    >
                      {sorted.map(function (_, i) {
                        return (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        );
                      })}
                    </Pie>
                    <Tooltip content={ChartTip} />
                  </PieChart>
                </ResponsiveContainer>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {sorted.slice(0, 7).map(function (item, i) {
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 13,
                        }}
                      >
                        <div
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 3,
                            background: COLORS[i],
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            color: "#94a3b8",
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            color: "#e2e8f0",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {fmt(item.cost)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FinOps Score */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>
                FinOps Score
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  marginBottom: 20,
                }}
              >
                <ScoreRing score={data.finopsScore.overall} />
                <div>
                  <div style={{ fontSize: 14, color: "#64748b" }}>
                    Score Geral
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: scoreColor(data.finopsScore.overall),
                      marginTop: 2,
                    }}
                  >
                    {data.finopsScore.overall >= 75
                      ? "Bom"
                      : data.finopsScore.overall >= 50
                        ? "Moderado"
                        : "Precisa melhorar"}
                  </div>
                </div>
              </div>

              {data.finopsScore.categories.map(function (cat, i) {
                return (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ fontSize: 14, color: "#94a3b8" }}>
                        {cat.name}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: scoreColor(cat.score),
                        }}
                      >
                        {cat.score}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: cat.score + "%",
                          background: scoreColor(cat.score),
                          borderRadius: 3,
                          transition: "width .8s ease-out",
                        }}
                      />
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#475569", marginTop: 2 }}
                    >
                      {cat.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Treemap */}
            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>
                Mapa de Custos - Modulos Terraform
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <Treemap
                  data={treeData}
                  dataKey="value"
                  nameKey="label"
                  content={TreeCell}
                  animationDuration={450}
                />
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ========== MODULES TAB ========== */}
        {view === "modules" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {/* Bar Chart */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>
                Custo por Modulo
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={data.modules}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.025)"
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#475569", fontSize: 12 }}
                    tickFormatter={function (v) {
                      return "$" + v;
                    }}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fill: "#94a3b8", fontSize: 13 }}
                    width={110}
                  />
                  <Tooltip content={ChartTip} />
                  <Bar
                    dataKey="cost"
                    radius={[0, 5, 5, 0]}
                    animationDuration={600}
                  >
                    {data.modules.map(function (_, i) {
                      return (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Module List */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>
                Modulos ({data.modules.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {data.modules.map(function (mod, i) {
                  var pct = (mod.cost / data.total) * 100;
                  return (
                    <div
                      key={i}
                      onMouseEnter={function () {
                        setHovered(i);
                      }}
                      onMouseLeave={function () {
                        setHovered(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        borderRadius: 10,
                        background:
                          hovered === i
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(255,255,255,0.012)",
                        border: "1px solid rgba(255,255,255,0.03)",
                        transition: "all .12s",
                        cursor: "default",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                        {mod.label}
                      </span>
                      <div
                        style={{
                          width: 80,
                          height: 4,
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: pct + "%",
                            background: COLORS[i % COLORS.length],
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: COLORS[i % COLORS.length],
                          minWidth: 60,
                          textAlign: "right",
                        }}
                      >
                        {fmt(mod.cost)}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#475569",
                          minWidth: 34,
                          textAlign: "right",
                        }}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========== DETAILS TAB ========== */}
        {view === "details" && (
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>
              Detalhamento ({sorted.length} recursos)
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 3px",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Recurso",
                      "Modulo",
                      "Tipo",
                      "Custo/mes",
                      "% Total",
                      "Custo/ano",
                    ].map(function (h, i) {
                      return (
                        <th
                          key={i}
                          style={{
                            padding: "10px 14px",
                            textAlign: i > 2 ? "right" : "left",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#475569",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          {h}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(function (item, i) {
                    var pct = (item.cost / data.total) * 100;
                    var modIdx = data.modules.findIndex(function (m) {
                      return m.name === item.module;
                    });
                    var pColor =
                      pct > 20
                        ? "#f87171"
                        : pct > 10
                          ? "#fbbf24"
                          : "#34d399";

                    return (
                      <tr
                        key={i}
                        style={{ transition: "background 0.12s" }}
                        onMouseEnter={function (e) {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.035)";
                        }}
                        onMouseLeave={function (e) {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 14px",
                            borderRadius: "7px 0 0 7px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                            }}
                          >
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 5,
                              background:
                                COLORS[
                                  modIdx >= 0 ? modIdx % COLORS.length : 0
                                ] + "14",
                              color:
                                COLORS[
                                  modIdx >= 0 ? modIdx % COLORS.length : 0
                                ],
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {item.module}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 5,
                              background:
                                item.type === "fixed"
                                  ? "rgba(96,165,250,0.08)"
                                  : "rgba(251,191,36,0.08)",
                              color:
                                item.type === "fixed" ? "#60a5fa" : "#fbbf24",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {item.type === "fixed" ? "Fixo" : "Variavel"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            textAlign: "right",
                            fontWeight: 700,
                            fontSize: 15,
                            color: pColor,
                          }}
                        >
                          {fmt(item.cost)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 50,
                                height: 4,
                                background: "rgba(255,255,255,0.04)",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: pct + "%",
                                  background: pColor,
                                  borderRadius: 2,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            textAlign: "right",
                            fontSize: 13,
                            color: "#475569",
                            borderRadius: "0 7px 7px 0",
                          }}
                        >
                          {fmt(item.cost * 12)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        padding: 14,
                        fontWeight: 800,
                        fontSize: 15,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      TOTAL
                    </td>
                    <td
                      style={{
                        padding: 14,
                        textAlign: "right",
                        fontWeight: 800,
                        fontSize: 18,
                        color: "#818cf8",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {fmt(data.total)}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        textAlign: "right",
                        fontSize: 12,
                        color: "#64748b",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      100%
                    </td>
                    <td
                      style={{
                        padding: 14,
                        textAlign: "right",
                        fontWeight: 800,
                        fontSize: 15,
                        color: "#818cf8",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {fmt(data.total * 12)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ========== FOOTER ========== */}
        <div
          style={{
            marginTop: 24,
            padding: "16px 0",
            borderTop: "1px solid rgba(255,255,255,0.025)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "#334155" }}>
            Powered by Infracost | {data.resources.detected} resources |{" "}
            {data.currency}
          </span>
          <span style={{ fontSize: 12, color: "#334155" }}>
            FastMeals FinOps Dashboard 2026 - vynnydev
          </span>
        </div>
      </div>
    </div>
  );
}