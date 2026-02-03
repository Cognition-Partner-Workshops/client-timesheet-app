#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QTimer>
#include <QTableWidget>
#include <QLabel>
#include <QProgressBar>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QGroupBox>
#include <QPushButton>

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void updateSystemInfo();
    void refreshProcessList();

private:
    void setupUI();
    void setupMemorySection();
    void setupProcessSection();
    
    struct MemoryInfo {
        long long total;
        long long used;
        long long free;
        long long available;
        long long buffers;
        long long cached;
        long long swapTotal;
        long long swapUsed;
        long long swapFree;
    };
    
    MemoryInfo getMemoryInfo();
    QList<QStringList> getProcessList();
    QString formatBytes(long long bytes);

    QWidget *centralWidget;
    QVBoxLayout *mainLayout;
    
    QGroupBox *memoryGroupBox;
    QLabel *totalMemoryLabel;
    QLabel *usedMemoryLabel;
    QLabel *freeMemoryLabel;
    QLabel *availableMemoryLabel;
    QLabel *buffersLabel;
    QLabel *cachedLabel;
    QProgressBar *memoryProgressBar;
    
    QGroupBox *swapGroupBox;
    QLabel *swapTotalLabel;
    QLabel *swapUsedLabel;
    QLabel *swapFreeLabel;
    QProgressBar *swapProgressBar;
    
    QGroupBox *processGroupBox;
    QTableWidget *processTable;
    QPushButton *refreshButton;
    QLabel *processCountLabel;
    
    QTimer *updateTimer;
};

#endif // MAINWINDOW_H
