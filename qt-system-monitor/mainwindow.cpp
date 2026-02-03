#include "mainwindow.h"
#include <QFile>
#include <QTextStream>
#include <QDir>
#include <QHeaderView>
#include <QFont>
#include <QRegularExpression>
#include <fstream>
#include <sstream>
#include <string>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    setupUI();
    
    updateTimer = new QTimer(this);
    connect(updateTimer, &QTimer::timeout, this, &MainWindow::updateSystemInfo);
    updateTimer->start(1000);
    
    updateSystemInfo();
}

MainWindow::~MainWindow()
{
}

void MainWindow::setupUI()
{
    centralWidget = new QWidget(this);
    setCentralWidget(centralWidget);
    
    mainLayout = new QVBoxLayout(centralWidget);
    mainLayout->setSpacing(10);
    mainLayout->setContentsMargins(10, 10, 10, 10);
    
    setupMemorySection();
    setupProcessSection();
}

void MainWindow::setupMemorySection()
{
    QHBoxLayout *memoryLayout = new QHBoxLayout();
    
    memoryGroupBox = new QGroupBox("RAM Memory", this);
    QVBoxLayout *memLayout = new QVBoxLayout(memoryGroupBox);
    
    memoryProgressBar = new QProgressBar(this);
    memoryProgressBar->setMinimum(0);
    memoryProgressBar->setMaximum(100);
    memoryProgressBar->setTextVisible(true);
    memoryProgressBar->setFormat("Memory Usage: %p%");
    memoryProgressBar->setMinimumHeight(25);
    memLayout->addWidget(memoryProgressBar);
    
    QGridLayout *memInfoLayout = new QGridLayout();
    
    totalMemoryLabel = new QLabel("Total: --", this);
    usedMemoryLabel = new QLabel("Used: --", this);
    freeMemoryLabel = new QLabel("Free: --", this);
    availableMemoryLabel = new QLabel("Available: --", this);
    buffersLabel = new QLabel("Buffers: --", this);
    cachedLabel = new QLabel("Cached: --", this);
    
    QFont labelFont = totalMemoryLabel->font();
    labelFont.setPointSize(10);
    totalMemoryLabel->setFont(labelFont);
    usedMemoryLabel->setFont(labelFont);
    freeMemoryLabel->setFont(labelFont);
    availableMemoryLabel->setFont(labelFont);
    buffersLabel->setFont(labelFont);
    cachedLabel->setFont(labelFont);
    
    memInfoLayout->addWidget(totalMemoryLabel, 0, 0);
    memInfoLayout->addWidget(usedMemoryLabel, 0, 1);
    memInfoLayout->addWidget(freeMemoryLabel, 1, 0);
    memInfoLayout->addWidget(availableMemoryLabel, 1, 1);
    memInfoLayout->addWidget(buffersLabel, 2, 0);
    memInfoLayout->addWidget(cachedLabel, 2, 1);
    
    memLayout->addLayout(memInfoLayout);
    memoryLayout->addWidget(memoryGroupBox);
    
    swapGroupBox = new QGroupBox("Swap Memory", this);
    QVBoxLayout *swapLayout = new QVBoxLayout(swapGroupBox);
    
    swapProgressBar = new QProgressBar(this);
    swapProgressBar->setMinimum(0);
    swapProgressBar->setMaximum(100);
    swapProgressBar->setTextVisible(true);
    swapProgressBar->setFormat("Swap Usage: %p%");
    swapProgressBar->setMinimumHeight(25);
    swapLayout->addWidget(swapProgressBar);
    
    QGridLayout *swapInfoLayout = new QGridLayout();
    
    swapTotalLabel = new QLabel("Total: --", this);
    swapUsedLabel = new QLabel("Used: --", this);
    swapFreeLabel = new QLabel("Free: --", this);
    
    swapTotalLabel->setFont(labelFont);
    swapUsedLabel->setFont(labelFont);
    swapFreeLabel->setFont(labelFont);
    
    swapInfoLayout->addWidget(swapTotalLabel, 0, 0);
    swapInfoLayout->addWidget(swapUsedLabel, 0, 1);
    swapInfoLayout->addWidget(swapFreeLabel, 1, 0);
    
    swapLayout->addLayout(swapInfoLayout);
    memoryLayout->addWidget(swapGroupBox);
    
    mainLayout->addLayout(memoryLayout);
}

void MainWindow::setupProcessSection()
{
    processGroupBox = new QGroupBox("Running Tasks/Processes", this);
    QVBoxLayout *processLayout = new QVBoxLayout(processGroupBox);
    
    QHBoxLayout *buttonLayout = new QHBoxLayout();
    
    processCountLabel = new QLabel("Total Processes: --", this);
    QFont countFont = processCountLabel->font();
    countFont.setBold(true);
    processCountLabel->setFont(countFont);
    buttonLayout->addWidget(processCountLabel);
    
    buttonLayout->addStretch();
    
    refreshButton = new QPushButton("Refresh", this);
    connect(refreshButton, &QPushButton::clicked, this, &MainWindow::refreshProcessList);
    buttonLayout->addWidget(refreshButton);
    
    processLayout->addLayout(buttonLayout);
    
    processTable = new QTableWidget(this);
    processTable->setColumnCount(5);
    processTable->setHorizontalHeaderLabels({"PID", "User", "CPU %", "Memory %", "Command"});
    processTable->horizontalHeader()->setStretchLastSection(true);
    processTable->horizontalHeader()->setSectionResizeMode(0, QHeaderView::ResizeToContents);
    processTable->horizontalHeader()->setSectionResizeMode(1, QHeaderView::ResizeToContents);
    processTable->horizontalHeader()->setSectionResizeMode(2, QHeaderView::ResizeToContents);
    processTable->horizontalHeader()->setSectionResizeMode(3, QHeaderView::ResizeToContents);
    processTable->setSelectionBehavior(QAbstractItemView::SelectRows);
    processTable->setEditTriggers(QAbstractItemView::NoEditTriggers);
    processTable->setAlternatingRowColors(true);
    processTable->setSortingEnabled(true);
    
    processLayout->addWidget(processTable);
    
    mainLayout->addWidget(processGroupBox, 1);
}

void MainWindow::updateSystemInfo()
{
    MemoryInfo memInfo = getMemoryInfo();
    
    if (memInfo.total > 0) {
        int memPercent = static_cast<int>((memInfo.used * 100) / memInfo.total);
        memoryProgressBar->setValue(memPercent);
        
        totalMemoryLabel->setText(QString("Total: %1").arg(formatBytes(memInfo.total)));
        usedMemoryLabel->setText(QString("Used: %1").arg(formatBytes(memInfo.used)));
        freeMemoryLabel->setText(QString("Free: %1").arg(formatBytes(memInfo.free)));
        availableMemoryLabel->setText(QString("Available: %1").arg(formatBytes(memInfo.available)));
        buffersLabel->setText(QString("Buffers: %1").arg(formatBytes(memInfo.buffers)));
        cachedLabel->setText(QString("Cached: %1").arg(formatBytes(memInfo.cached)));
    }
    
    if (memInfo.swapTotal > 0) {
        int swapPercent = static_cast<int>((memInfo.swapUsed * 100) / memInfo.swapTotal);
        swapProgressBar->setValue(swapPercent);
        
        swapTotalLabel->setText(QString("Total: %1").arg(formatBytes(memInfo.swapTotal)));
        swapUsedLabel->setText(QString("Used: %1").arg(formatBytes(memInfo.swapUsed)));
        swapFreeLabel->setText(QString("Free: %1").arg(formatBytes(memInfo.swapFree)));
    } else {
        swapProgressBar->setValue(0);
        swapTotalLabel->setText("Total: N/A");
        swapUsedLabel->setText("Used: N/A");
        swapFreeLabel->setText("Free: N/A");
    }
    
    refreshProcessList();
}

void MainWindow::refreshProcessList()
{
    QList<QStringList> processes = getProcessList();
    
    processTable->setSortingEnabled(false);
    processTable->setRowCount(processes.size());
    
    for (int i = 0; i < processes.size(); ++i) {
        const QStringList &proc = processes[i];
        for (int j = 0; j < proc.size() && j < 5; ++j) {
            QTableWidgetItem *item = new QTableWidgetItem(proc[j]);
            if (j == 0 || j == 2 || j == 3) {
                item->setTextAlignment(Qt::AlignRight | Qt::AlignVCenter);
            }
            processTable->setItem(i, j, item);
        }
    }
    
    processTable->setSortingEnabled(true);
    processCountLabel->setText(QString("Total Processes: %1").arg(processes.size()));
}

MainWindow::MemoryInfo MainWindow::getMemoryInfo()
{
    MemoryInfo info = {0, 0, 0, 0, 0, 0, 0, 0, 0};
    
    std::ifstream file("/proc/meminfo");
    if (!file.is_open()) {
        return info;
    }
    
    std::string line;
    while (std::getline(file, line)) {
        std::istringstream iss(line);
        std::string key;
        long long value;
        std::string unit;
        
        iss >> key >> value >> unit;
        
        if (key == "MemTotal:") info.total = value * 1024;
        else if (key == "MemFree:") info.free = value * 1024;
        else if (key == "MemAvailable:") info.available = value * 1024;
        else if (key == "Buffers:") info.buffers = value * 1024;
        else if (key == "Cached:") info.cached = value * 1024;
        else if (key == "SwapTotal:") info.swapTotal = value * 1024;
        else if (key == "SwapFree:") info.swapFree = value * 1024;
    }
    
    file.close();
    
    info.used = info.total - info.free - info.buffers - info.cached;
    info.swapUsed = info.swapTotal - info.swapFree;
    
    return info;
}

QList<QStringList> MainWindow::getProcessList()
{
    QList<QStringList> processes;
    
    QDir procDir("/proc");
    QStringList entries = procDir.entryList(QDir::Dirs | QDir::NoDotAndDotDot);
    
    for (const QString &entry : entries) {
        bool ok;
        int pid = entry.toInt(&ok);
        if (!ok) continue;
        
        QString statusPath = QString("/proc/%1/status").arg(pid);
        QString statPath = QString("/proc/%1/stat").arg(pid);
        QString cmdlinePath = QString("/proc/%1/cmdline").arg(pid);
        
        QFile statusFile(statusPath);
        if (!statusFile.open(QIODevice::ReadOnly | QIODevice::Text)) continue;
        
        QString user = "unknown";
        QString name = "unknown";
        double memPercent = 0.0;
        
        QTextStream statusIn(&statusFile);
        while (!statusIn.atEnd()) {
            QString line = statusIn.readLine();
            if (line.startsWith("Name:")) {
                name = line.mid(5).trimmed();
            } else if (line.startsWith("Uid:")) {
                QStringList uidParts = line.mid(4).trimmed().split(QRegularExpression("\\s+"));
                if (!uidParts.isEmpty()) {
                    int uid = uidParts[0].toInt();
                    QFile passwdFile("/etc/passwd");
                    if (passwdFile.open(QIODevice::ReadOnly | QIODevice::Text)) {
                        QTextStream passwdIn(&passwdFile);
                        while (!passwdIn.atEnd()) {
                            QString passwdLine = passwdIn.readLine();
                            QStringList passwdParts = passwdLine.split(':');
                            if (passwdParts.size() >= 3 && passwdParts[2].toInt() == uid) {
                                user = passwdParts[0];
                                break;
                            }
                        }
                        passwdFile.close();
                    }
                }
            } else if (line.startsWith("VmRSS:")) {
                long long rss = line.mid(6).trimmed().split(QRegularExpression("\\s+"))[0].toLongLong() * 1024;
                MemoryInfo memInfo = getMemoryInfo();
                if (memInfo.total > 0) {
                    memPercent = (rss * 100.0) / memInfo.total;
                }
            }
        }
        statusFile.close();
        
        QFile cmdlineFile(cmdlinePath);
        QString cmdline = name;
        if (cmdlineFile.open(QIODevice::ReadOnly)) {
            QByteArray cmdData = cmdlineFile.readAll();
            cmdData.replace('\0', ' ');
            QString cmd = QString::fromUtf8(cmdData).trimmed();
            if (!cmd.isEmpty()) {
                cmdline = cmd;
            }
            cmdlineFile.close();
        }
        
        double cpuPercent = 0.0;
        
        QStringList processInfo;
        processInfo << QString::number(pid)
                    << user
                    << QString::number(cpuPercent, 'f', 1)
                    << QString::number(memPercent, 'f', 1)
                    << cmdline;
        
        processes.append(processInfo);
    }
    
    return processes;
}

QString MainWindow::formatBytes(long long bytes)
{
    const char* units[] = {"B", "KB", "MB", "GB", "TB"};
    int unitIndex = 0;
    double size = static_cast<double>(bytes);
    
    while (size >= 1024.0 && unitIndex < 4) {
        size /= 1024.0;
        unitIndex++;
    }
    
    return QString("%1 %2").arg(size, 0, 'f', 2).arg(units[unitIndex]);
}
