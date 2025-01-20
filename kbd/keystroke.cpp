#include <Windows.h>
#include <iostream>

int keymap[38] = {
    '6', '5', '4', '3', '2', '1', 'Z', 'Y',
    'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q',
    'P', 'O', 'N', 'M', 'L', 'K', 'J', 'I',
    'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A',
    VK_OEM_MINUS, VK_OEM_PLUS, VK_OEM_4,
    VK_OEM_6, VK_OEM_5, VK_OEM_1
};

int main(int argc, char *argv[]) {

    if (argc != 3) {
        return 1;
    }

    int key = std::stoi(argv[1]);
    int activate = std::stoi(argv[2]);

    if (key > 38 || key < 1) {
        return 2;
    }

    INPUT inputs[1] = {};
    ZeroMemory(inputs, sizeof(inputs));

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = keymap[key - 1];

    if (!activate) {
        inputs[0].ki.dwFlags = KEYEVENTF_KEYUP;
    }

    UINT uSent = SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
    if (uSent != ARRAYSIZE(inputs))
    {
        std::cout << "error\n";
    }
}